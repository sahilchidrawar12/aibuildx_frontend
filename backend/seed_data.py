import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import secrets
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("🌱 Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.plans.delete_many({})
    await db.companies.delete_many({})
    await db.projects.delete_many({})
    await db.transactions.delete_many({})
    print("✅ Cleared existing data")
    
    # Create Plans
    plans = [
        {
            "id": "plan_basic_001",
            "name": "Basic",
            "price": 35000,
            "currency": "INR",
            "maxUsers": 5,
            "storageLimitGB": 50,
            "isActive": True
        },
        {
            "id": "plan_pro_002",
            "name": "Pro",
            "price": 65000,
            "currency": "INR",
            "maxUsers": 15,
            "storageLimitGB": 200,
            "isActive": True
        },
        {
            "id": "plan_enterprise_003",
            "name": "Enterprise",
            "price": 125000,
            "currency": "INR",
            "maxUsers": 50,
            "storageLimitGB": 1000,
            "isActive": True
        }
    ]
    await db.plans.insert_many(plans)
    print("✅ Created 3 pricing plans")
    
    # Create Super Admin
    super_admin = {
        "id": "user_superadmin_001",
        "name": "Super Admin",
        "email": "admin@aibuildx.com",
        "passwordHash": hash_password("admin123"),
        "role": "SuperAdmin",
        "createdAt": datetime.now(timezone.utc)
    }
    await db.users.insert_one(super_admin)
    print("✅ Created Super Admin (admin@aibuildx.com / admin123)")
    
    # Create Marketing User
    marketing_user = {
        "id": "user_marketing_001",
        "name": "Marketing Team",
        "email": "marketing@aibuildx.com",
        "passwordHash": hash_password("marketing123"),
        "role": "Marketing",
        "createdAt": datetime.now(timezone.utc)
    }
    await db.users.insert_one(marketing_user)
    print("✅ Created Marketing User (marketing@aibuildx.com / marketing123)")
    
    # Create Sample Company
    company = {
        "id": "company_001",
        "name": "TechStruct Engineering",
        "subscriptionStatus": "Active",
        "subscriptionTier": "Pro",
        "maxUsers": 15,
        "storageLimit": 200,
        "subscriptionExpiryDate": datetime.now(timezone.utc) + timedelta(days=30),
        "createdAt": datetime.now(timezone.utc)
    }
    await db.companies.insert_one(company)
    print("✅ Created Sample Company (TechStruct Engineering)")
    
    # Create Client Admin
    client_admin = {
        "id": "user_clientadmin_001",
        "name": "John Doe",
        "email": "john@techstruct.com",
        "passwordHash": hash_password("john123"),
        "role": "ClientAdmin",
        "companyId": "company_001",
        "createdAt": datetime.now(timezone.utc)
    }
    await db.users.insert_one(client_admin)
    print("✅ Created Client Admin (john@techstruct.com / john123)")
    
    # Create Client Engineer
    client_engineer = {
        "id": "user_engineer_001",
        "name": "Jane Smith",
        "email": "jane@techstruct.com",
        "passwordHash": hash_password("jane123"),
        "role": "ClientEngineer",
        "companyId": "company_001",
        "createdAt": datetime.now(timezone.utc)
    }
    await db.users.insert_one(client_engineer)
    print("✅ Created Client Engineer (jane@techstruct.com / jane123)")
    
    # Create Sample Project
    project = {
        "id": "project_001",
        "title": "City Tower Construction",
        "location": "Mumbai, Maharashtra",
        "drawingType": "PDF",
        "fileName": "sample_blueprint.pdf",
        "filePath": "/app/backend/uploads/sample_blueprint.pdf",
        "status": "Completed",
        "createdBy": "user_engineer_001",
        "companyId": "company_001",
        "createdAt": datetime.now(timezone.utc)
    }
    await db.projects.insert_one(project)
    print("✅ Created Sample Project")
    
    # Create Sample Transaction
    transaction = {
        "id": "txn_001",
        "companyId": "company_001",
        "amount": 65000,
        "currency": "INR",
        "status": "Paid",
        "razorpayOrderId": "order_sample_001",
        "razorpayPaymentId": "pay_sample_001",
        "planSnapshot": {
            "name": "Pro",
            "price": 65000,
            "maxUsers": 15,
            "storageLimitGB": 200
        },
        "date": datetime.now(timezone.utc)
    }
    await db.transactions.insert_one(transaction)
    print("✅ Created Sample Transaction")
    
    print("\n🎉 Database seeded successfully!")
    print("\n📋 Test Credentials:")
    print("   Super Admin: admin@aibuildx.com / admin123")
    print("   Marketing: marketing@aibuildx.com / marketing123")
    print("   Client Admin: john@techstruct.com / john123")
    print("   Client Engineer: jane@techstruct.com / jane123")

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()