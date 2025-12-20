# Swato Admin - Food Delivery Management System

A modern admin panel built with Next.js, TypeScript, Shadcn UI, and Tailwind CSS for managing food delivery operations.

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard page
│   ├── orders/                  # Orders management
│   ├── restaurants/             # Restaurants management
│   ├── customers/               # Customers management
│   ├── drivers/                 # Drivers management
│   ├── menu/                    # Menu items management
│   ├── analytics/               # Analytics and reports
│   ├── settings/                # System settings
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to dashboard)
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Shadcn UI)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   └── dropdown-menu.tsx
│   ├── layout/                  # Layout components
│   │   ├── AdminLayout.tsx      # Main admin layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── Header.tsx           # Top header with search and profile
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── DashboardStats.tsx   # Statistics cards
│   │   ├── RecentOrders.tsx     # Recent orders list
│   │   └── RevenueChart.tsx     # Revenue visualization
│   ├── orders/                  # Order management components
│   ├── restaurants/             # Restaurant management components
│   ├── customers/               # Customer management components
│   ├── drivers/                 # Driver management components
│   ├── menu/                    # Menu management components
│   ├── analytics/               # Analytics components
│   └── settings/                # Settings components
├── lib/                         # Utility libraries
│   ├── config.ts                # Application configuration
│   └── api.ts                   # API client and utilities
├── types/                       # TypeScript type definitions
│   └── index.ts                 # All application types
├── constants/                   # Application constants
│   └── index.ts                 # Constants and enums
├── utils/                       # Utility functions
│   └── index.ts                 # Helper functions
├── hooks/                       # Custom React hooks
├── context/                     # React context providers
└── styles/                      # Additional styles
```

## 🏗️ Architecture Principles

### Code Organization
- **Functional components** with TypeScript interfaces
- **Named exports** for all components
- **Modular structure** with clear separation of concerns
- **Utility-first** approach with reusable functions

### File Naming
- PascalCase for components (`AdminLayout.tsx`)
- camelCase for utilities and hooks (`formatCurrency.ts`)
- kebab-case for directories (`food-delivery`)

### TypeScript Usage
- Strict TypeScript configuration
- Interface-based type definitions
- Proper typing for all props and state
- Utility types for API responses and forms

## 🚀 Features

### Dashboard
- Real-time statistics and metrics
- Revenue charts and analytics
- Recent orders overview
- Performance indicators

### Order Management
- Order tracking and status updates
- Customer order history
- Delivery coordination
- Payment processing

### Restaurant Management
- Restaurant onboarding and profiles
- Menu management
- Performance analytics
- Commission tracking

### Customer Management
- Customer profiles and preferences
- Order history and analytics
- Loyalty program management
- Support ticket handling

### Driver Management
- Driver onboarding and verification
- Real-time location tracking
- Performance metrics
- Earnings and payouts

### Analytics & Reporting
- Revenue and sales analytics
- Performance dashboards
- Customer insights
- Operational metrics

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: React hooks + Context API
- **API**: RESTful API with custom client
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Authentication
JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=your-database-url

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Payment
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 📚 Key Conventions

### Component Structure
```typescript
// Component file structure
interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### API Integration
```typescript
// API client usage
import { apiClient } from '@/lib/api';

const fetchData = async () => {
  try {
    const data = await apiClient.get('/endpoint');
    return data;
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

### Utility Functions
```typescript
// Utility usage
import { formatCurrency, formatDate } from '@/utils';

const price = formatCurrency(29.99);
const date = formatDate(new Date());
```

## 🔍 Development Guidelines

### Code Style
- Use functional components over class components
- Prefer hooks over lifecycle methods
- Implement proper error boundaries
- Use meaningful variable and function names
- Keep components small and focused

### Performance
- Minimize 'use client' directives
- Use React Server Components where possible
- Implement proper loading states
- Optimize images and assets
- Use dynamic imports for code splitting

### Testing
- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows
- Mock API responses for testing

## 🚀 Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup
- Configure production environment variables
- Set up database connections
- Configure CDN for static assets
- Set up monitoring and logging

## 📋 Roadmap

- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] AI-powered recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
