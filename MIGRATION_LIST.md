# Front-End Code Migration List

This document lists all files that should be migrated to the separate front-end repository.

## ✅ Already Migrated
- `public/` folder (you mentioned this is done)

---

## 📄 Pages to Migrate (`src/app/`)

### Root & Main Pages
- ✅ `src/app/page.tsx` - **KEEP IN ADMIN** (now redirects to login)
- ❌ `src/app/restaurants/page.tsx` - **MIGRATE** (customer-facing restaurant listing)
- ❌ `src/app/restaurants/[id]/page.tsx` - **MIGRATE** (restaurant detail page)
- ❌ `src/app/restaurants/[id]/menu/page.tsx` - **MIGRATE** (restaurant menu page)
- ❌ `src/app/search/page.tsx` - **MIGRATE** (search page)
- ❌ `src/app/orders/page.tsx` - **MIGRATE** (customer orders page - NOT admin)
- ❌ `src/app/customers/page.tsx` - **MIGRATE** (customer profile page - NOT admin)
- ❌ `src/app/drivers/page.tsx` - **MIGRATE** (if customer-facing driver page exists)
- ❌ `src/app/dashboard/page.tsx` - **MIGRATE** (if customer dashboard exists)
- ❌ `src/app/menu/` - **MIGRATE** (if directory exists with pages)
- ❌ `src/app/settings/` - **MIGRATE** (customer settings page)
- ❌ `src/app/analytics/` - **MIGRATE** (if customer analytics page exists)

### Keep in Admin (DO NOT MIGRATE)
- ✅ `src/app/login/page.tsx` - **KEEP** (admin login)
- ✅ `src/app/admin/**` - **KEEP** (all admin pages)
- ✅ `src/app/api/**` - **KEEP** (API routes - may need to share)

---

## 🧩 Components to Migrate (`src/components/`)

### Home Page Components
- ❌ `src/components/home/HeroSection.tsx` - **MIGRATE**
- ❌ `src/components/home/FoodCategories.tsx` - **MIGRATE**
- ❌ `src/components/home/BetterFoodSection.tsx` - **MIGRATE**
- ❌ `src/components/home/DownloadAppSection.tsx` - **MIGRATE**
- ❌ `src/components/home/RestaurantGrid.tsx` - **MIGRATE**

### Layout Components (Front-End)
- ❌ `src/components/layout/Header.tsx` - **MIGRATE** (customer header with cart)
- ❌ `src/components/layout/Footer.tsx` - **MIGRATE** (customer footer)
- ❌ `src/components/layout/Sidebar.tsx` - **MIGRATE** (if customer sidebar exists)
- ✅ `src/components/layout/AdminHeader.tsx` - **KEEP** (admin only)
- ✅ `src/components/layout/AdminSidebar.tsx` - **KEEP** (admin only)
- ✅ `src/components/layout/AdminLayout.tsx` - **KEEP** (admin only)

### Cart Components
- ❌ `src/components/cart/CartSidebar.tsx` - **MIGRATE**

### Food Components
- ❌ `src/components/food/FoodCard.tsx` - **MIGRATE**

### Auth Components (Customer-Facing)
- ❌ `src/components/auth/SignInModal.tsx` - **MIGRATE** (customer sign-in)
- ❌ `src/components/auth/SignUpModal.tsx` - **MIGRATE** (customer sign-up)

### Restaurant Components (Customer-Facing)
- ❌ `src/components/restaurants/**` - **MIGRATE** (if any exist)
- ✅ `src/components/admin/restaurants/**` - **KEEP** (admin only)

### Order Components (Customer-Facing)
- ❌ `src/components/orders/**` - **MIGRATE** (if any exist)
- ✅ `src/components/admin/orders/**` - **KEEP** (admin only)

### Other Customer Components
- ❌ `src/components/customers/**` - **MIGRATE** (if customer-facing)
- ❌ `src/components/drivers/**` - **MIGRATE** (if customer-facing)
- ❌ `src/components/menu/**` - **MIGRATE** (if any exist)
- ❌ `src/components/settings/**` - **MIGRATE** (if customer settings)
- ❌ `src/components/analytics/**` - **MIGRATE** (if customer analytics)
- ❌ `src/components/forms/**` - **MIGRATE** (if customer forms)
- ❌ `src/components/dashboard/**` - **MIGRATE** (if customer dashboard components)
  - ⚠️ **NOTE**: There's a duplicate `DashboardStats.tsx` in both `dashboard/` and `admin/dashboard/` - migrate the customer one, keep admin one

### UI Components (Shared - May Need Both)
- ⚠️ `src/components/ui/` - **SHARED** (most UI components can be shared)
  - ❌ `src/components/ui/location-input.tsx` - **MIGRATE** (front-end specific)
  - ❌ `src/components/ui/sticky-footer.tsx` - **MIGRATE** (front-end specific)
  - ✅ Keep all other UI components in both repos OR share via npm package

---

## 🔄 Context Providers to Migrate (`src/context/`)

- ❌ `src/context/CartContext.tsx` - **MIGRATE** (customer cart)
- ❌ `src/context/LocationContext.tsx` - **MIGRATE** (customer location)

---

## 🛠️ Utilities to Migrate (`src/utils/`)

- ⚠️ `src/utils/index.ts` - **PARTIAL MIGRATE**
  - Functions like `formatCurrency`, `formatDate`, `formatDateTime`, `formatPhoneNumber` can be shared
  - Keep `cn()` function in both (or share)
  - Migrate any customer-specific utility functions

---

## 📦 Other Files to Consider

### Constants
- ⚠️ `src/constants/index.ts` - **REVIEW & MIGRATE IF CUSTOMER-SPECIFIC**
  - If contains customer-facing constants (restaurant categories, food types, etc.), migrate
  - If contains admin constants, keep in admin

### Types
- ⚠️ `src/types/index.ts` - **REVIEW & MIGRATE IF CUSTOMER-SPECIFIC**
  - Migrate customer-facing types (CartItem, Order, Restaurant, etc.)
  - Keep admin-specific types

### Styles
- ⚠️ `src/styles/**` - **REVIEW**
  - Migrate customer-specific styles
  - Keep admin-specific styles

### Hooks
- ⚠️ `src/hooks/**` - **REVIEW & MIGRATE IF CUSTOMER-SPECIFIC**
  - Migrate customer-facing hooks
  - Keep admin hooks

### Lib Files
- ⚠️ `src/lib/api.ts` - **REVIEW**
  - If contains customer API calls, migrate
  - If admin-only, keep
- ⚠️ `src/lib/config.ts` - **REVIEW**
  - Share if contains shared config
  - Split if customer vs admin specific
- ✅ `src/lib/supabase/**` - **KEEP IN BOTH** (needed in both repos)
- ✅ `src/lib/utils.ts` - **KEEP IN BOTH** (or share)

---

## 📋 Migration Checklist

### Step 1: Pages
- [ ] Migrate `src/app/restaurants/**`
- [ ] Migrate `src/app/search/page.tsx`
- [ ] Migrate `src/app/orders/page.tsx` (customer version)
- [ ] Migrate `src/app/customers/page.tsx` (customer version)
- [ ] Migrate `src/app/dashboard/page.tsx` (customer version)
- [ ] Migrate `src/app/settings/**`
- [ ] Migrate `src/app/menu/**` (if exists)
- [ ] Migrate `src/app/analytics/**` (if exists)

### Step 2: Components
- [ ] Migrate `src/components/home/**`
- [ ] Migrate `src/components/layout/Header.tsx`
- [ ] Migrate `src/components/layout/Footer.tsx`
- [ ] Migrate `src/components/cart/**`
- [ ] Migrate `src/components/food/**`
- [ ] Migrate `src/components/auth/**` (customer auth)
- [ ] Migrate `src/components/ui/location-input.tsx`
- [ ] Migrate `src/components/ui/sticky-footer.tsx`
- [ ] Review and migrate customer-specific components from other folders

### Step 3: Context
- [ ] Migrate `src/context/CartContext.tsx`
- [ ] Migrate `src/context/LocationContext.tsx`

### Step 4: Utilities & Config
- [ ] Review and migrate customer-specific utilities
- [ ] Review and migrate customer-specific constants
- [ ] Review and migrate customer-specific types
- [ ] Review and migrate customer-specific hooks

### Step 5: Cleanup
- [ ] Remove migrated files from admin repo
- [ ] Update imports in admin repo
- [ ] Test admin panel still works
- [ ] Update documentation

---

## ⚠️ Important Notes

1. **API Routes**: The `src/app/api/**` routes might need to be shared or duplicated. Review which APIs are customer-facing vs admin-only.

2. **Shared Components**: UI components in `src/components/ui/` can be:
   - Kept in both repos
   - Shared via npm package
   - Shared via git submodule
   - Shared via monorepo structure

3. **Supabase Client**: Both repos will need Supabase client setup. Keep `src/lib/supabase/**` in both.

4. **Environment Variables**: Make sure to copy `.env.local` or `.env.example` to the new front-end repo.

5. **Package Dependencies**: Review `package.json` and migrate customer-specific dependencies:
   - `motion` (if used in front-end)
   - Any other front-end specific packages

6. **TypeScript Types**: The `src/types/database.ts` (Supabase types) should be in both repos OR shared.

---

## 🎯 Quick Reference: What to Keep in Admin

**KEEP THESE IN ADMIN REPO:**
- ✅ `src/app/login/page.tsx`
- ✅ `src/app/admin/**` (all admin pages)
- ✅ `src/app/api/**` (API routes - review if shared)
- ✅ `src/components/admin/**` (all admin components)
- ✅ `src/components/layout/Admin*` (admin layout components)
- ✅ `src/lib/supabase/**` (Supabase setup)
- ✅ `src/middleware.ts` (Next.js middleware)
- ✅ `src/lib/supabase/middleware.ts` (Supabase middleware)

**MIGRATE TO FRONT-END REPO:**
- ❌ All customer-facing pages (restaurants, orders, search, etc.)
- ❌ All customer-facing components (home, cart, food, etc.)
- ❌ Customer context providers (Cart, Location)
- ❌ Customer-specific utilities and types

---

## 📝 After Migration

1. Update the root `page.tsx` in admin (already done - redirects to login)
2. Update middleware to redirect front-end routes (already done)
3. Remove migrated files from admin repo
4. Test that admin panel still works correctly
5. Update any broken imports
