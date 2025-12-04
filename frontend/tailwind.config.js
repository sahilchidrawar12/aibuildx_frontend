/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
  				'25%': { transform: 'translateY(-30px) translateX(20px) scale(1.05)' },
  				'50%': { transform: 'translateY(-15px) translateX(-30px) scale(0.95)' },
  				'75%': { transform: 'translateY(-40px) translateX(10px) scale(1.1)' }
  			},
  			'pulse-ring': {
  				'0%': { boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.4)' },
  				'50%': { boxShadow: '0 0 0 10px rgba(102, 126, 234, 0)' },
  				'100%': { boxShadow: '0 0 0 0 rgba(102, 126, 234, 0)' }
  			},
  			'pulse-wave': {
  				'0%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.5' },
  				'100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' }
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			},
  			slide: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			},
  			fadeInUp: {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			slideUp: {
  				from: { opacity: '0', transform: 'translateY(30px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			slideDown: {
  				from: { opacity: '0', transform: 'translateY(-20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			bounce: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			float: 'float 20s infinite ease-in-out',
  			'float-delayed-1': 'float 25s infinite ease-in-out',
  			'float-delayed-2': 'float 30s infinite ease-in-out -5s',
  			'float-delayed-3': 'float 35s infinite ease-in-out -10s',
  			'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
  			'pulse-wave': 'pulse-wave 2s ease-out infinite',
  			shimmer: 'shimmer 2s infinite',
  			slide: 'slide 2s linear infinite',
  			'fade-in-up': 'fadeInUp 0.5s ease',
  			'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			bounce: 'bounce 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};