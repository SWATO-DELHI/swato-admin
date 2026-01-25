// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star, MapPin, Phone, Mail, Clock, ArrowLeft, Store,
  FileText, Building2, CreditCard, Image as ImageIcon,
  MapPinned, Mic, User, Calendar, UtensilsCrossed, Map
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { RestaurantDetailActions } from '@/components/admin/restaurants/RestaurantDetailActions'
import { RestaurantMenu } from '@/components/admin/restaurants/RestaurantMenu'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// Google Maps API Key from environment
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Helper function to get public URL for storage files
function getStorageUrl(path: string | null, bucket: string = 'partner-documents'): string | null {
  if (!path) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  // If it's already a full URL, return as is
  if (path.startsWith('http')) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Helper function to generate Google Maps Static Image URL
function getStaticMapUrl(lat: number, lng: number, zoom: number = 15): string {
  if (!GOOGLE_MAPS_API_KEY) return '';
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

// Helper function to generate Google Maps link for navigation
function getGoogleMapsLink(lat: number, lng: number, name: string): string {
  const encodedName = encodeURIComponent(name);
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`;
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch restaurant with all columns including new onboarding fields
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(`
      *,
      owner:users!restaurants_owner_id_fkey(id, name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (!restaurant) {
    notFound()
  }

  // Fetch restaurant orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name)
    `)
    .eq('restaurant_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Fetch menu categories and items
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', id)
    .order('sort_order')

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', id)

  // Parse time slots if available
  const timeSlots = restaurant.time_slots || restaurant.metadata?.timeSlots || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/restaurants"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Restaurants
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
          <p className="text-muted-foreground mt-1">Manage restaurant details, menu, and orders</p>
        </div>
        <RestaurantDetailActions restaurant={restaurant} />
      </div>

      {/* Verification Status Banner */}
      {restaurant.verification_status === 'pending' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Pending Verification</p>
              <p className="text-muted-foreground text-sm">This restaurant has submitted their onboarding application and is awaiting verification.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Restaurant Info Card */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            {restaurant.restaurant_front_image || restaurant.logo_url || restaurant.cover_url ? (
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted relative">
                <Image
                  src={getStorageUrl(restaurant.restaurant_front_image || restaurant.logo_url || restaurant.cover_url) || ''}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-foreground">{restaurant.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-muted-foreground text-sm">{restaurant.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Owner Name */}
            {(restaurant.owner_name || restaurant.metadata?.ownerName) && (
              <div className="flex items-center gap-2 text-foreground/80">
                <User className="h-4 w-4" />
                <span className="text-sm">Owner: {restaurant.owner_name || restaurant.metadata?.ownerName}</span>
              </div>
            )}

            {/* Address */}
            <div className="flex items-center gap-2 text-foreground/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurant.complete_address || restaurant.address || 'Address not set'}</span>
            </div>

            {/* Phone */}
            {restaurant.owner_phone && (
              <div className="flex items-center gap-2 text-foreground/80">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{restaurant.owner_phone}</span>
              </div>
            )}

            {/* WhatsApp */}
            {restaurant.whatsapp_number && restaurant.whatsapp_number !== restaurant.owner_phone && (
              <div className="flex items-center gap-2 text-foreground/80">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-sm">WhatsApp: {restaurant.whatsapp_number}</span>
              </div>
            )}

            {/* Email */}
            {(restaurant.email || restaurant.owner?.email) && (
              <div className="flex items-center gap-2 text-foreground/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{restaurant.email || restaurant.owner?.email}</span>
              </div>
            )}

            {/* Operating Hours */}
            <div className="flex items-center gap-2 text-foreground/80">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {restaurant.opening_time || 'N/A'} - {restaurant.closing_time || 'N/A'}
              </span>
            </div>

            {/* Working Days */}
            {restaurant.working_days && restaurant.working_days.length > 0 && (
              <div className="flex items-start gap-2 text-foreground/80">
                <Calendar className="h-4 w-4 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {restaurant.working_days.map((day: string) => (
                    <Badge key={day} variant="outline" className="text-xs bg-muted border-border">
                      {day.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Commission Rate</span>
              <span className="text-xl font-bold text-foreground">{restaurant.commission_rate || 24}%</span>
            </div>
          </div>
        </Card>

        {/* Statistics Card */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Completed Orders</p>
              <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">₹{avgOrderValue.toFixed(0)}</p>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status</h3>
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Verification Status</p>
              <Badge className={`border ${
                restaurant.verification_status === 'approved'
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : restaurant.verification_status === 'rejected'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {restaurant.verification_status || 'Pending'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Onboarding Step</p>
              <Badge className="border bg-blue-500/10 text-blue-400 border-blue-500/30">
                {restaurant.onboarding_step || 'Not Started'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Active Status</p>
              <Badge className={`border ${
                restaurant.is_active
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
              }`}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Verified</p>
              <Badge className={`border ${
                restaurant.is_verified
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {restaurant.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="details">Onboarding Details</TabsTrigger>
          <TabsTrigger value="location">Map & Location</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        {/* Map & Location Tab - Full Google Maps view */}
        <TabsContent value="location" className="mt-4">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Map className="h-5 w-5 text-orange-400" />
              Restaurant Location
            </h3>

            {restaurant.lat && restaurant.lng ? (
              <div className="space-y-4">
                {/* Google Maps Embed */}
                <div className="w-full h-96 rounded-lg overflow-hidden border border-border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${restaurant.lat},${restaurant.lng}&zoom=17`}
                  />
                </div>

                {/* Location Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase mb-1">Complete Address</p>
                    <p className="text-foreground">{restaurant.complete_address || restaurant.address || 'Not set'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase mb-1">Coordinates</p>
                    <p className="text-foreground font-mono">{restaurant.lat}, {restaurant.lng}</p>
                  </div>
                  {restaurant.landmark && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-xs uppercase mb-1">Landmark</p>
                      <p className="text-foreground">{restaurant.landmark}</p>
                    </div>
                  )}
                  {restaurant.pincode && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-xs uppercase mb-1">Pincode</p>
                      <p className="text-foreground">{restaurant.pincode}</p>
                    </div>
                  )}
                </div>

                {/* Open in Google Maps Button */}
                <a
                  href={getGoogleMapsLink(Number(restaurant.lat), Number(restaurant.lng), restaurant.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Map className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPinned className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No location coordinates available</p>
                <p className="text-sm mt-1">The restaurant has not set their location yet.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Onboarding Details Tab */}
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Location Details Card */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-orange-400" />
                Location Details
              </h3>

              {/* Google Maps Preview */}
              {restaurant.lat && restaurant.lng && GOOGLE_MAPS_API_KEY && (
                <div className="mb-4">
                  <p className="text-muted-foreground text-xs uppercase mb-2">Map Location</p>
                  <a
                    href={getGoogleMapsLink(Number(restaurant.lat), Number(restaurant.lng), restaurant.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={getStaticMapUrl(Number(restaurant.lat), Number(restaurant.lng))}
                      alt={`Map location of ${restaurant.name}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      Open in Google Maps
                    </div>
                  </a>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Shop/Plot Number</p>
                  <p className="text-foreground">{restaurant.shop_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Floor</p>
                  <p className="text-foreground">{restaurant.floor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Building Name</p>
                  <p className="text-foreground">{restaurant.building || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Pincode</p>
                  <p className="text-foreground">{restaurant.pincode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Landmark</p>
                  <p className="text-foreground">{restaurant.landmark || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Complete Address</p>
                  <p className="text-foreground">{restaurant.complete_address || restaurant.address || 'N/A'}</p>
                </div>
                {restaurant.lat && restaurant.lng && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase mb-1">Coordinates</p>
                    <p className="text-foreground font-mono text-sm">{restaurant.lat}, {restaurant.lng}</p>
                  </div>
                )}
                {restaurant.directions_audio_url && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase mb-1">Voice Directions</p>
                    <audio
                      controls
                      src={getStorageUrl(restaurant.directions_audio_url) || ''}
                      className="w-full mt-2"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </Card>

            {/* Financial Details Card */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-400" />
                Financial & Tax Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">PAN Number</p>
                  <p className="text-foreground font-mono">{restaurant.pan_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Card Holder Name</p>
                  <p className="text-foreground">{restaurant.card_holder || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">GSTIN</p>
                  <p className="text-foreground font-mono">{restaurant.gstin || 'No GST'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Bank IFSC</p>
                  <p className="text-foreground font-mono">{restaurant.bank_ifsc || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Bank Account</p>
                  <p className="text-foreground font-mono">{restaurant.bank_account || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">FSSAI Number</p>
                  <p className="text-foreground font-mono">{restaurant.fssai_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Outlet Type</p>
                  <p className="text-foreground">{restaurant.outlet_type || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Menu & Business Details Card */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-orange-400" />
                Menu & Business Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Cuisine Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.cuisine_type && restaurant.cuisine_type.length > 0 ? (
                      restaurant.cuisine_type.map((cuisine: string) => (
                        <Badge key={cuisine} variant="outline" className="bg-muted border-border">
                          {cuisine}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Menu Type</p>
                  <p className="text-foreground">{restaurant.menu_type === 'veg' ? 'Veg Only' : restaurant.menu_type === 'both' ? 'Veg & Non-Veg' : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Cost for Two</p>
                  <p className="text-foreground">₹{restaurant.cost_for_two || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Min Order Amount</p>
                  <p className="text-foreground">₹{restaurant.min_order_amount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Avg Delivery Time</p>
                  <p className="text-foreground">{restaurant.avg_delivery_time || 'N/A'} mins</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Has POS</p>
                  <p className="text-foreground">{restaurant.has_pos ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase mb-1">Packaging Type</p>
                  <p className="text-foreground">{restaurant.packaging_type || 'N/A'}</p>
                </div>
                {restaurant.packaging_type === 'fixed' && restaurant.packaging_charge && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase mb-1">Packaging Charge</p>
                    <p className="text-foreground">₹{restaurant.packaging_charge}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Time Slots Card */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Operating Hours
              </h3>
              <div className="space-y-3">
                {timeSlots && timeSlots.length > 0 ? (
                  timeSlots.map((slot: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-foreground/80">Slot {index + 1}</span>
                      <span className="text-foreground font-medium">{slot.open} - {slot.close}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground/80">Hours</span>
                    <span className="text-foreground font-medium">{restaurant.opening_time || 'N/A'} - {restaurant.closing_time || 'N/A'}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-400" />
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* PAN Document */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">PAN Card Document</p>
                {restaurant.pan_doc_url ? (
                  <a
                    href={getStorageUrl(restaurant.pan_doc_url) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-orange-400" />
                      <div>
                        <p className="text-foreground font-medium">PAN Document</p>
                        <p className="text-muted-foreground text-sm">Click to view</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </div>

              {/* FSSAI Document */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">FSSAI Certificate</p>
                {restaurant.fssai_doc_url ? (
                  <a
                    href={getStorageUrl(restaurant.fssai_doc_url) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-foreground font-medium">FSSAI Document</p>
                        <p className="text-muted-foreground text-sm">Click to view</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </div>

              {/* Menu File */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">Menu File</p>
                {restaurant.menu_image_url ? (
                  <a
                    href={getStorageUrl(restaurant.menu_image_url) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="text-foreground font-medium">Menu Document</p>
                        <p className="text-muted-foreground text-sm">Click to view</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-4">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-400" />
              Restaurant Images
            </h3>

            {/* Restaurant Front Image */}
            {restaurant.restaurant_front_image && (
              <div className="mb-6">
                <p className="text-muted-foreground text-sm font-medium mb-3">Restaurant Front</p>
                <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={getStorageUrl(restaurant.restaurant_front_image) || ''}
                    alt="Restaurant Front"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Restaurant Images Gallery */}
            {restaurant.restaurant_images && restaurant.restaurant_images.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-3">Restaurant Gallery ({restaurant.restaurant_images.length} images)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {restaurant.restaurant_images.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={imageUrl.startsWith('http') ? imageUrl : getStorageUrl(imageUrl, 'restaurants') || ''}
                        alt={`Restaurant Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cover & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {restaurant.cover_url && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-3">Cover Image</p>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={restaurant.cover_url}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              {restaurant.logo_url && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-3">Logo</p>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={restaurant.logo_url}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {!restaurant.restaurant_front_image &&
             (!restaurant.restaurant_images || restaurant.restaurant_images.length === 0) &&
             !restaurant.cover_url &&
             !restaurant.logo_url && (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Menu Management Tab */}
        <TabsContent value="menu" className="mt-4">
          <RestaurantMenu
            restaurantId={id}
            categories={categories || []}
            menuItems={menuItems || []}
          />
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="orders" className="mt-4">
          <Card className="bg-card border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Order History</h3>
              <p className="text-sm text-muted-foreground mt-1">Recent orders from this restaurant</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-orange-400 hover:text-orange-300 font-mono text-sm"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-foreground/80">{order.customer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-foreground font-medium">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={`border capitalize ${
                            order.status === 'delivered'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
