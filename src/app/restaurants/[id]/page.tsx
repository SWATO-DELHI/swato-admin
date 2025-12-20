'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Phone, Clock, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

// Mock restaurant data
const mockRestaurants = [
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
    description: 'Authentic Italian pizzas made with fresh ingredients and traditional recipes. Serving Delhi for over 10 years.',
    menu: [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, basil and olive oil',
        price: 320,
        originalPrice: 380,
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Pizza.avif',
        preparationTime: 20
      },
      {
        id: '2',
        name: 'Chicken Supreme Pizza',
        description: 'Chicken, onions, bell peppers, mushrooms and cheese',
        price: 450,
        category: 'Pizza',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Biryani.avif',
        preparationTime: 25
      },
      {
        id: '3',
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni, mozzarella cheese and tomato sauce',
        price: 420,
        category: 'Pizza',
        isVeg: false,
        isAvailable: false,
        image: '/assets/images/food/Biryani.avif',
        preparationTime: 22
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
    description: 'Juicy burgers with fresh patties and premium ingredients. The best burgers in Delhi!',
    menu: [
      {
        id: '4',
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, cheese and special sauce',
        price: 250,
        category: 'Burger',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Burger.avif',
        preparationTime: 15
      },
      {
        id: '5',
        name: 'Veggie Burger',
        description: 'Plant-based patty with lettuce, tomato, cheese and vegan sauce',
        price: 220,
        category: 'Burger',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Salad.avif',
        preparationTime: 15
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
    description: 'Authentic Indian cuisine with traditional flavors. From butter chicken to biryani, we serve the best of India.',
    menu: [
      {
        id: '6',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken and spices',
        price: 280,
        category: 'Rice',
        isVeg: false,
        isAvailable: true,
        image: '/assets/images/food/Biryani.avif',
        preparationTime: 25
      },
      {
        id: '7',
        name: 'Paneer Biryani',
        description: 'Aromatic basmati rice with paneer and spices',
        price: 260,
        category: 'Rice',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Paneer.avif',
        preparationTime: 25
      },
      {
        id: '8',
        name: 'Chole Bhature',
        description: 'Spicy chickpea curry with fried bread',
        price: 180,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        image: '/assets/images/food/Chole Bhature.avif',
        preparationTime: 20
      }
    ]
  }
];

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  const { addToCart, cartItems, setIsCartOpen } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const foundRestaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (foundRestaurant) {
      setRestaurant(foundRestaurant);
    }
  }, [restaurantId]);

  const filteredMenu = selectedCategory === 'All'
    ? restaurant?.menu || []
    : restaurant?.menu.filter(item => item.category === selectedCategory) || [];

  const categories = ['All', ...new Set(restaurant?.menu.map(item => item.category) || [])];

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant.name,
      quantity: 1,
      isVeg: item.isVeg
    });
    setIsCartOpen(true);
  };

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Restaurant not found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              width={200}
              height={200}
              className="rounded-lg object-cover mx-auto lg:mx-0"
            />

            <div className="mt-6 lg:mt-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <Badge className={restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>

              <p className="text-gray-600 mt-2">{restaurant.description}</p>

              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-gray-600 ml-1">({restaurant.reviews} reviews)</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {restaurant.deliveryTime}
                </div>

                <div className="text-gray-600">
                  ₹{restaurant.deliveryFee} delivery fee
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {restaurant.address}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {restaurant.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Filter */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      selectedCategory === category
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="flex-1">
            <div className="space-y-6">
              {categories.slice(1).map(category => {
                const categoryItems = restaurant.menu.filter(item => item.category === category);
                if (selectedCategory !== 'All' && selectedCategory !== category) return null;
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                    <div className="space-y-4">
                      {categoryItems.map((item) => {
                        const quantity = getItemQuantity(item.id);
                        const discount = item.originalPrice
                          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                          : 0;

                        return (
                          <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={100}
                                  height={100}
                                  className="rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {item.name}
                                      </h3>
                                      <p className="text-gray-600 mt-1">{item.description}</p>

                                      <div className="flex items-center space-x-4 mt-3">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xl font-bold text-gray-900">
                                            ₹{item.price}
                                          </span>
                                          {item.originalPrice && (
                                            <span className="text-sm text-gray-500 line-through">
                                              ₹{item.originalPrice}
                                            </span>
                                          )}
                                          {discount > 0 && (
                                            <Badge className="bg-green-100 text-green-800">
                                              {discount}% OFF
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                          <Clock className="h-4 w-4" />
                                          {item.preparationTime} min
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                      {/* Veg/Non-Veg indicator */}
                                      <div className={`w-5 h-5 rounded-sm border-2 ${
                                        item.isVeg
                                          ? 'border-green-500 bg-green-500'
                                          : 'border-red-500 bg-red-500'
                                      } flex items-center justify-center`}>
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                      </div>

                                      {/* Quantity Controls */}
                                      {quantity === 0 ? (
                                        <Button
                                          onClick={() => handleAddToCart(item)}
                                          className="bg-orange-500 hover:bg-orange-600"
                                          disabled={!item.isAvailable}
                                        >
                                          {item.isAvailable ? 'Add' : 'Unavailable'}
                                        </Button>
                                      ) : (
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                              const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                                              if (cartItem && cartItem.quantity > 1) {
                                                // Decrease quantity
                                                addToCart({
                                                  id: item.id,
                                                  name: item.name,
                                                  price: item.price,
                                                  image: item.image,
                                                  restaurant: restaurant.name,
                                                  quantity: -1,
                                                  isVeg: item.isVeg
                                                });
                                              }
                                            }}
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                          <span className="font-medium min-w-[2rem] text-center">
                                            {quantity}
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleAddToCart(item)}
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {category !== categories[categories.length - 1] && <Separator className="my-8" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Sticky Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingBag className="h-6 w-6 text-orange-500" />
              <span className="font-medium">
                {cartItems.reduce((total, item) => total + item.quantity, 0)} items in cart
              </span>
            </div>
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 px-8"
            >
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}










