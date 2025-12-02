from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import bcrypt
import jwt
import razorpay
import secrets
import aiofiles
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))

# Create upload directory
UPLOAD_DIR = Path(os.environ.get('UPLOAD_DIR', '/app/backend/uploads'))
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

# JWT Settings
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# Create the main app
app = FastAPI(title="AiBuild X API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "SuperAdmin"
    MARKETING = "Marketing"
    CLIENT_ADMIN = "ClientAdmin"
    CLIENT_ENGINEER = "ClientEngineer"

class SubscriptionStatus(str, Enum):
    ACTIVE = "Active"
    EXPIRED = "Expired"
    GRACE_PERIOD = "GracePeriod"

class ProjectStatus(str, Enum):
    UPLOADED = "Uploaded"
    PROCESSING = "Processing"
    COMPLETED = "Completed"

class TransactionStatus(str, Enum):
    CREATED = "Created"
    PAID = "Paid"
    FAILED = "Failed"

class DrawingType(str, Enum):
    PDF = "PDF"
    DWG = "DWG"

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    role: UserRole
    companyId: Optional[str] = None
    createdAt: datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    companyId: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    price: float
    currency: str = "INR"
    maxUsers: int
    storageLimitGB: int
    isActive: bool = True

class PlanCreate(BaseModel):
    name: str
    price: float
    currency: str = "INR"
    maxUsers: int
    storageLimitGB: int

class PlanUpdate(BaseModel):
    price: Optional[float] = None
    maxUsers: Optional[int] = None
    storageLimitGB: Optional[int] = None
    isActive: Optional[bool] = None

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    subscriptionTier: Optional[str] = None
    subscriptionStatus: SubscriptionStatus = SubscriptionStatus.EXPIRED
    maxUsers: int = 1
    storageLimit: int = 10
    subscriptionExpiryDate: Optional[datetime] = None
    razorpayCustomerId: Optional[str] = None
    createdAt: datetime

class CompanyCreate(BaseModel):
    name: str
    adminName: str
    adminEmail: EmailStr
    adminPassword: str
    planId: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    location: str
    drawingType: DrawingType
    fileName: str
    filePath: str
    status: ProjectStatus = ProjectStatus.UPLOADED
    createdBy: str
    companyId: str
    createdAt: datetime

class ProjectCreate(BaseModel):
    title: str
    location: str
    drawingType: DrawingType

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    companyId: str
    amount: float
    currency: str
    status: TransactionStatus
    razorpayOrderId: Optional[str] = None
    razorpayPaymentId: Optional[str] = None
    razorpaySignature: Optional[str] = None
    planSnapshot: dict
    date: datetime

class OrderCreate(BaseModel):
    planId: str

class PaymentVerify(BaseModel):
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: str

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    newPassword: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

async def check_subscription_status(user: dict):
    if user["role"] in ["SuperAdmin", "Marketing"]:
        return True
    
    company = await db.companies.find_one({"id": user["companyId"]})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if company["subscriptionStatus"] == SubscriptionStatus.EXPIRED:
        raise HTTPException(status_code=403, detail="Subscription expired. Please contact admin to renew.")
    
    return True

# Authentication Routes
@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "companyId": user.get("companyId")
        }
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "companyId": user.get("companyId")
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(data: PasswordReset):
    user = await db.users.find_one({"email": data.email})
    if not user:
        return {"message": "If email exists, reset link has been sent"}
    
    reset_token = secrets.token_urlsafe(32)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "resetPasswordToken": reset_token,
            "resetPasswordExpires": datetime.now(timezone.utc) + timedelta(hours=1)
        }}
    )
    
    # TODO: Send email with reset link
    return {"message": "If email exists, reset link has been sent", "token": reset_token}

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordResetConfirm):
    user = await db.users.find_one({
        "resetPasswordToken": data.token,
        "resetPasswordExpires": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    hashed = hash_password(data.newPassword)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"passwordHash": hashed}, "$unset": {"resetPasswordToken": "", "resetPasswordExpires": ""}}
    )
    
    return {"message": "Password reset successfully"}

# Super Admin Routes
@api_router.get("/admin/dashboard")
async def admin_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_companies = await db.companies.count_documents({})
    total_revenue = await db.transactions.aggregate([
        {"$match": {"status": TransactionStatus.PAID}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    active_subscriptions = await db.companies.count_documents({"subscriptionStatus": SubscriptionStatus.ACTIVE})
    
    return {
        "totalCompanies": total_companies,
        "totalRevenue": total_revenue[0]["total"] if total_revenue else 0,
        "activeSubscriptions": active_subscriptions
    }

@api_router.post("/admin/users")
async def create_marketing_user(user_data: UserCreate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if user_data.role not in [UserRole.MARKETING, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=400, detail="Can only create Marketing or SuperAdmin users")
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user_id = secrets.token_urlsafe(16)
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "passwordHash": hash_password(user_data.password),
        "role": user_data.role,
        "createdAt": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(new_user)
    return {"id": user_id, "message": "User created successfully"}

@api_router.get("/admin/users")
async def get_all_users(user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    users = await db.users.find({}, {"_id": 0, "passwordHash": 0}).to_list(1000)
    return users

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# Plan Management
@api_router.post("/admin/plans")
async def create_plan(plan_data: PlanCreate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    plan_id = secrets.token_urlsafe(16)
    new_plan = {
        "id": plan_id,
        **plan_data.model_dump(),
        "isActive": True
    }
    
    await db.plans.insert_one(new_plan)
    return {"id": plan_id, "message": "Plan created successfully"}

@api_router.get("/plans")
async def get_plans():
    plans = await db.plans.find({"isActive": True}, {"_id": 0}).to_list(100)
    return plans

@api_router.get("/admin/plans")
async def get_all_plans(user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    plans = await db.plans.find({}, {"_id": 0}).to_list(100)
    return plans

@api_router.patch("/admin/plans/{plan_id}")
async def update_plan(plan_id: str, plan_update: PlanUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in plan_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.plans.update_one({"id": plan_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"message": "Plan updated successfully"}

# Marketing Routes
@api_router.post("/marketing/companies")
async def onboard_company(company_data: CompanyCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.MARKETING]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if admin email already exists
    existing = await db.users.find_one({"email": company_data.adminEmail})
    if existing:
        raise HTTPException(status_code=400, detail="Admin email already exists")
    
    company_id = secrets.token_urlsafe(16)
    user_id = secrets.token_urlsafe(16)
    
    # Get plan details if provided
    plan = None
    if company_data.planId:
        plan = await db.plans.find_one({"id": company_data.planId})
    
    # Create company
    new_company = {
        "id": company_id,
        "name": company_data.name,
        "subscriptionStatus": SubscriptionStatus.ACTIVE if plan else SubscriptionStatus.EXPIRED,
        "maxUsers": plan["maxUsers"] if plan else 1,
        "storageLimit": plan["storageLimitGB"] if plan else 10,
        "subscriptionTier": plan["name"] if plan else None,
        "subscriptionExpiryDate": (datetime.now(timezone.utc) + timedelta(days=30)) if plan else None,
        "createdAt": datetime.now(timezone.utc)
    }
    
    # Create admin user
    new_admin = {
        "id": user_id,
        "name": company_data.adminName,
        "email": company_data.adminEmail,
        "passwordHash": hash_password(company_data.adminPassword),
        "role": UserRole.CLIENT_ADMIN,
        "companyId": company_id,
        "createdAt": datetime.now(timezone.utc)
    }
    
    await db.companies.insert_one(new_company)
    await db.users.insert_one(new_admin)
    
    return {"companyId": company_id, "adminId": user_id, "message": "Company onboarded successfully"}

@api_router.get("/marketing/companies")
async def get_companies(user: dict = Depends(get_current_user)):
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.MARKETING]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    return companies

# Company & User Management
@api_router.get("/companies/{company_id}")
async def get_company(company_id: str, user: dict = Depends(get_current_user)):
    # Users can only see their own company unless they're admin/marketing
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.MARKETING]:
        if user.get("companyId") != company_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return company

@api_router.post("/companies/{company_id}/users")
async def add_company_user(company_id: str, user_data: UserCreate, user: dict = Depends(get_current_user)):
    # Only ClientAdmin can add users to their company
    if user["role"] != UserRole.CLIENT_ADMIN or user.get("companyId") != company_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    company = await db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check user limit
    current_users = await db.users.count_documents({"companyId": company_id})
    if current_users >= company["maxUsers"]:
        raise HTTPException(status_code=400, detail="User limit reached. Please upgrade your plan.")
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user_id = secrets.token_urlsafe(16)
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "passwordHash": hash_password(user_data.password),
        "role": UserRole.CLIENT_ENGINEER,
        "companyId": company_id,
        "createdAt": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(new_user)
    return {"id": user_id, "message": "User added successfully"}

@api_router.get("/companies/{company_id}/users")
async def get_company_users(company_id: str, user: dict = Depends(get_current_user)):
    # Users can only see users in their company
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.MARKETING]:
        if user.get("companyId") != company_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    users = await db.users.find({"companyId": company_id}, {"_id": 0, "passwordHash": 0}).to_list(1000)
    return users

# Project Management
@api_router.post("/projects")
async def create_project(project: ProjectCreate, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    # Check subscription
    await check_subscription_status(user)
    
    if not user.get("companyId"):
        raise HTTPException(status_code=400, detail="User not associated with any company")
    
    # Save file
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['pdf', 'dwg']:
        raise HTTPException(status_code=400, detail="Only PDF and DWG files are allowed")
    
    project_id = secrets.token_urlsafe(16)
    file_name = f"{project_id}.{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create project
    new_project = {
        "id": project_id,
        "title": project.title,
        "location": project.location,
        "drawingType": project.drawingType,
        "fileName": file.filename,
        "filePath": str(file_path),
        "status": ProjectStatus.UPLOADED,
        "createdBy": user["id"],
        "companyId": user["companyId"],
        "createdAt": datetime.now(timezone.utc)
    }
    
    await db.projects.insert_one(new_project)
    return {"id": project_id, "message": "Project created successfully"}

@api_router.get("/projects")
async def get_projects(user: dict = Depends(get_current_user)):
    if not user.get("companyId"):
        raise HTTPException(status_code=400, detail="User not associated with any company")
    
    # All users in a company can see all projects
    projects = await db.projects.find({"companyId": user["companyId"]}, {"_id": 0}).to_list(1000)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.MARKETING]:
        if project["companyId"] != user.get("companyId"):
            raise HTTPException(status_code=403, detail="Access denied")
    
    return project

# Subscription & Payments
@api_router.post("/subscriptions/create-order")
async def create_order(order_data: OrderCreate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.CLIENT_ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can manage subscriptions")
    
    if not user.get("companyId"):
        raise HTTPException(status_code=400, detail="User not associated with any company")
    
    plan = await db.plans.find_one({"id": order_data.planId})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Create Razorpay order
    amount = int(plan["price"] * 100)  # Convert to paise
    razorpay_order = razorpay_client.order.create({
        "amount": amount,
        "currency": plan["currency"],
        "payment_capture": 1
    })
    
    # Create transaction
    transaction_id = secrets.token_urlsafe(16)
    transaction = {
        "id": transaction_id,
        "companyId": user["companyId"],
        "amount": plan["price"],
        "currency": plan["currency"],
        "status": TransactionStatus.CREATED,
        "razorpayOrderId": razorpay_order["id"],
        "planSnapshot": {
            "name": plan["name"],
            "price": plan["price"],
            "maxUsers": plan["maxUsers"],
            "storageLimitGB": plan["storageLimitGB"]
        },
        "date": datetime.now(timezone.utc)
    }
    
    await db.transactions.insert_one(transaction)
    
    return {
        "orderId": razorpay_order["id"],
        "amount": amount,
        "currency": plan["currency"],
        "keyId": os.environ['RAZORPAY_KEY_ID']
    }

@api_router.post("/subscriptions/verify-payment")
async def verify_payment(payment_data: PaymentVerify, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.CLIENT_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data.razorpayOrderId,
            'razorpay_payment_id': payment_data.razorpayPaymentId,
            'razorpay_signature': payment_data.razorpaySignature
        })
    except:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Update transaction
    transaction = await db.transactions.find_one({"razorpayOrderId": payment_data.razorpayOrderId})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await db.transactions.update_one(
        {"id": transaction["id"]},
        {"$set": {
            "status": TransactionStatus.PAID,
            "razorpayPaymentId": payment_data.razorpayPaymentId,
            "razorpaySignature": payment_data.razorpaySignature
        }}
    )
    
    # Update company subscription
    plan_snapshot = transaction["planSnapshot"]
    await db.companies.update_one(
        {"id": transaction["companyId"]},
        {"$set": {
            "subscriptionStatus": SubscriptionStatus.ACTIVE,
            "subscriptionTier": plan_snapshot["name"],
            "maxUsers": plan_snapshot["maxUsers"],
            "storageLimit": plan_snapshot["storageLimitGB"],
            "subscriptionExpiryDate": datetime.now(timezone.utc) + timedelta(days=30)
        }}
    )
    
    return {"message": "Payment verified and subscription activated"}

@api_router.get("/transactions")
async def get_transactions(user: dict = Depends(get_current_user)):
    if not user.get("companyId"):
        raise HTTPException(status_code=400, detail="User not associated with any company")
    
    transactions = await db.transactions.find({"companyId": user["companyId"]}, {"_id": 0}).to_list(1000)
    return transactions

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()