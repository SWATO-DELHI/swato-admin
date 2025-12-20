'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

// Mock restaurants data with menu items
const mockRestaurantsData = [
  {
    id: '1',
    name: 'Pizza Palace',
    image: '/assets/images/food/Biryani.avif',
    cuisine: 'Italian',
    rating: 4.5,
    reviews: 1247,
    deliveryTime: '25-35 min',
    deliveryFee: 40,
    minOrder: 200,
    address: 'Connaught Place, Delhi',
    phone: '+91-9876543210',
    isOpen: true,
    menu: [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, basil and olive oil',
        price: 320,
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Pizza.avif'
      },
      {
        id: '2',
        name: 'Chicken Supreme Pizza',
        description: 'Chicken, onions, bell peppers, mushrooms and cheese',
        price: 450,
        category: 'Pizza',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Biryani.avif'
      }
    ]
  },
  {
    id: '2',
    name: 'Burger Junction',
    image: '/assets/images/food/Bonda.avif',
    cuisine: 'American',
    rating: 4.2,
    reviews: 890,
    deliveryTime: '20-30 min',
    deliveryFee: 30,
    minOrder: 150,
    address: 'Karol Bagh, Delhi',
    phone: '+91-9876543211',
    isOpen: true,
    menu: [
      {
        id: '3',
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, cheese and special sauce',
        price: 250,
        category: 'Burger',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Burger.avif'
      }
    ]
  },
  {
    id: '3',
    name: 'Spice Route',
    image: '/assets/images/food/Chole Bhature.avif',
    cuisine: 'Indian',
    rating: 4.6,
    reviews: 2156,
    deliveryTime: '30-40 min',
    deliveryFee: 35,
    minOrder: 180,
    address: 'Rajouri Garden, Delhi',
    phone: '+91-9876543212',
    isOpen: true,
    menu: [
      {
        id: '4',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken and spices',
        price: 280,
        category: 'Rice',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Biryani.avif'
      },
      {
        id: '5',
        name: 'Paneer Biryani',
        description: 'Aromatic basmati rice with paneer and spices',
        price: 260,
        category: 'Rice',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Paneer.avif'
      }
    ]
  }
];

// Food categories and their related restaurants
const foodCategories = {
  'Biryani': ['Spice Route'],
  'Pizza': ['Pizza Palace'],
  'Burger': ['Burger Junction'],
  'Dosa': ['South Indian Delights'],
  'Cake': ['Sweet Dreams'],
  'Chole Bhature': ['Punjabi Tadka'],
  'Poha': ['Street Food Corner'],
  'Salad': ['Green Leaf'],
  'Tea': ['Chai Point'],
  'Vada': ['South Indian Delights']
};

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedFood = searchParams.get('food');

  const [restaurants, setRestaurants] = useState(mockRestaurantsData);
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurantsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    deliveryFee: '',
    minOrder: '',
    image: ''
  });

  useEffect(() => {
    let filtered = restaurants;

    // Filter by selected food category
    if (selectedFood && foodCategories[selectedFood]) {
      filtered = filtered.filter(restaurant =>
        foodCategories[selectedFood].includes(restaurant.name)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by cuisine
    if (cuisineFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.cuisine === cuisineFilter);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedFood, searchQuery, cuisineFilter]);

  const handleAddRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.cuisine) return;

    const restaurant = {
      id: Date.now().toString(),
      ...newRestaurant,
      rating: 0,
      reviews: 0,
      deliveryTime: '25-35 min',
      isOpen: true,
      menu: [],
      deliveryFee: parseInt(newRestaurant.deliveryFee) || 40,
      minOrder: parseInt(newRestaurant.minOrder) || 200
    };

    setRestaurants([...restaurants, restaurant]);
    setNewRestaurant({
      name: '',
      cuisine: '',
      address: '',
      phone: '',
      deliveryFee: '',
      minOrder: '',
      image: ''
    });
    setIsAddRestaurantOpen(false);
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setNewRestaurant({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      address: restaurant.address,
      phone: restaurant.phone,
      deliveryFee: restaurant.deliveryFee.toString(),
      minOrder: restaurant.minOrder.toString(),
      image: restaurant.image
    });
    setIsAddRestaurantOpen(true);
  };

  const handleUpdateRestaurant = () => {
    if (!editingRestaurant) return;

    const updatedRestaurants = restaurants.map(restaurant =>
      restaurant.id === editingRestaurant.id
        ? {
            ...restaurant,
            ...newRestaurant,
            deliveryFee: parseInt(newRestaurant.deliveryFee),
            minOrder: parseInt(newRestaurant.minOrder)
          }
        : restaurant
    );

    setRestaurants(updatedRestaurants);
    setEditingRestaurant(null);
    setIsAddRestaurantOpen(false);
    setNewRestaurant({
      name: '',
      cuisine: '',
      address: '',
      phone: '',
      deliveryFee: '',
      minOrder: '',
      image: ''
    });
  };

  const handleDeleteRestaurant = (restaurantId) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurants(restaurants.filter(r => r.id !== restaurantId));
    }
  };

  const getUniqueCuisines = () => {
    return [...new Set(restaurants.map(r => r.cuisine))];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedFood ? `Restaurants serving ${selectedFood}` : 'All Restaurants'}
              </h1>
              <p className="mt-2 text-gray-600">
                {filteredRestaurants.length} restaurants found
              </p>
            </div>
            <Button
              onClick={() => setIsAddRestaurantOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {getUniqueCuisines().map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                        <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRestaurant(restaurant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">{restaurant.rating}</span>
                        <span className="ml-1 text-sm text-gray-600">({restaurant.reviews})</span>
                      </div>
                    </div>
                    <Badge className={restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                    <div>₹{restaurant.deliveryFee} delivery</div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {restaurant.phone}
                  </div>

                  {/* Menu Items Count */}
                  <div className="text-sm text-gray-600">
                    {restaurant.menu.length} items in menu
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/restaurants/${restaurant.id}/menu`)}
                    >
                      Manage Menu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Restaurant Dialog */}
      <Dialog open={isAddRestaurantOpen} onOpenChange={setIsAddRestaurantOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant({...newRestaurant, cuisine: e.target.value})}
                  placeholder="e.g., Italian, Indian"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newRestaurant.address}
                onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                placeholder="Enter full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newRestaurant.phone}
                  onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newRestaurant.image}
                  onChange={(e) => setNewRestaurant({...newRestaurant, image: e.target.value})}
                  placeholder="/assets/images/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={newRestaurant.deliveryFee}
                  onChange={(e) => setNewRestaurant({...newRestaurant, deliveryFee: e.target.value})}
                  placeholder="40"
                />
              </div>
              <div>
                <Label htmlFor="minOrder">Min Order (₹)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={newRestaurant.minOrder}
                  onChange={(e) => setNewRestaurant({...newRestaurant, minOrder: e.target.value})}
                  placeholder="200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddRestaurantOpen(false);
                  setEditingRestaurant(null);
                  setNewRestaurant({
                    name: '',
                    cuisine: '',
                    address: '',
                    phone: '',
                    deliveryFee: '',
                    minOrder: '',
                    image: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingRestaurant ? handleUpdateRestaurant : handleAddRestaurant}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {editingRestaurant ? 'Update' : 'Add'} Restaurant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
