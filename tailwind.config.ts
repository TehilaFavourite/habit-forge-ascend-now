
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'learning-bg': 'hsl(var(--learning-bg))',
				'learning-secondary': 'hsl(var(--learning-secondary))',
				'learning-border': 'hsl(var(--learning-border))',
				'learning-primary': 'hsl(var(--learning-primary))',
				'learning-text': 'hsl(var(--learning-text))',
				
				'gratitude-bg': 'hsl(var(--gratitude-bg))',
				'gratitude-secondary': 'hsl(var(--gratitude-secondary))',
				'gratitude-border': 'hsl(var(--gratitude-border))',
				'gratitude-primary': 'hsl(var(--gratitude-primary))',
				
				'reflection-bg': 'hsl(var(--reflection-bg))',
				'reflection-secondary': 'hsl(var(--reflection-secondary))',
				'reflection-border': 'hsl(var(--reflection-border))',
				'reflection-primary': 'hsl(var(--reflection-primary))',
				
				'affirmation-bg': 'hsl(var(--affirmation-bg))',
				'affirmation-secondary': 'hsl(var(--affirmation-secondary))',
				'affirmation-border': 'hsl(var(--affirmation-border))',
				'affirmation-primary': 'hsl(var(--affirmation-primary))',

				'onboarding-bg': 'hsl(var(--onboarding-bg))',
				'onboarding-secondary': 'hsl(var(--onboarding-secondary))',
				'onboarding-border': 'hsl(var(--onboarding-border))',
				'onboarding-text': 'hsl(var(--onboarding-text))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-calm': 'var(--gradient-calm)',
				'gradient-soothing': 'var(--gradient-soothing)',
				'gradient-welcome': 'var(--gradient-welcome)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-work': 'var(--gradient-work)',
				'gradient-break': 'var(--gradient-break)',
			},
			boxShadow: {
				'calm': 'var(--shadow-calm)',
				'gentle': 'var(--shadow-gentle)',
				'welcome': 'var(--shadow-welcome)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
			},
			transitionTimingFunction: {
				'calm': 'var(--transition-calm)'
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-slow': 'pulse 3s infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
