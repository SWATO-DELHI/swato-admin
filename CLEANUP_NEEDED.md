# Admin Repo Cleanup Checklist

## Files to Remove (Front-End Code)

### Pages to Remove:
- [ ] `src/app/restaurants/page.tsx` (customer-facing)
- [ ] `src/app/restaurants/[id]/page.tsx` (customer-facing)
- [ ] `src/app/restaurants/[id]/menu/page.tsx` (customer-facing)
- [ ] `src/app/search/page.tsx` (customer-facing)
- [ ] `src/app/orders/page.tsx` (customer-facing - NOT admin/orders)
- [ ] `src/app/customers/page.tsx` (customer-facing - NOT admin/customers)
- [ ] `src/app/drivers/page.tsx` (if customer-facing)
- [ ] `src/app/dashboard/page.tsx` (if customer-facing)
- [ ] `src/app/menu/` (if exists)
- [ ] `src/app/settings/` (if customer-facing)
- [ ] `src/app/analytics/` (if customer-facing)

### Components to Remove:
- [ ] `src/components/home/*` (all home components)
- [ ] `src/components/layout/Header.tsx` (customer header)
- [ ] `src/components/layout/Footer.tsx` (customer footer)
- [ ] `src/components/layout/Sidebar.tsx` (if customer sidebar)
- [ ] `src/components/cart/*` (cart components)
- [ ] `src/components/food/*` (food components)
- [ ] `src/components/auth/SignInModal.tsx` (customer auth)
- [ ] `src/components/auth/SignUpModal.tsx` (customer auth)
- [ ] `src/components/ui/location-input.tsx` (front-end specific)
- [ ] `src/components/ui/sticky-footer.tsx` (front-end specific)
- [ ] `src/components/restaurants/*` (if customer-facing)
- [ ] `src/components/orders/*` (if customer-facing - NOT admin/orders)
- [ ] `src/components/customers/*` (if customer-facing - NOT admin/customers)
- [ ] `src/components/drivers/*` (if customer-facing - NOT admin/drivers)
- [ ] `src/components/menu/*` (if exists)
- [ ] `src/components/settings/*` (if customer-facing)
- [ ] `src/components/analytics/*` (if customer-facing)
- [ ] `src/components/dashboard/*` (if customer-facing - NOT admin/dashboard)
- [ ] `src/components/forms/*` (if customer-facing)

### Context to Remove:
- [ ] `src/context/CartContext.tsx` (customer cart)
- [ ] `src/context/LocationContext.tsx` (customer location)

### Keep in Admin:
- ✅ `src/app/login/page.tsx` - Admin login
- ✅ `src/app/admin/**` - All admin pages
- ✅ `src/components/admin/**` - All admin components
- ✅ `src/components/layout/Admin*` - Admin layout components
- ✅ `src/lib/supabase/**` - Supabase setup
- ✅ `src/middleware.ts` - Next.js middleware
- ✅ `src/utils/index.ts` - Can keep (shared utilities)
- ✅ `src/constants/index.ts` - Can keep (shared constants)

## Already Done:
- ✅ Root `page.tsx` redirects to `/login` or `/admin/dashboard`
- ✅ Middleware redirects front-end routes to login
- ✅ Layout updated (removed CartProvider, LocationProvider)

## After Cleanup:
1. Test admin panel still works
2. Verify all admin routes are accessible
3. Check that login page works
4. Ensure no broken imports
