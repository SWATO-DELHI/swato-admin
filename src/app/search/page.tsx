'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodCard } from '@/components/food/FoodCard';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

// Mock food data
const mockFoods = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese and special sauce',
    price: 250,
    originalPrice: 300,
    rating: 4.5,
    reviews: 1247,
    restaurant: 'Burger Junction',
    restaurantId: '1',
    image: '/assets/images/food/Burger.avif',
    category: 'Fast Food',
    cuisine: 'American',
    isVeg: false,
    isBestseller: true,
    preparationTime: 15,
    tags: ['burger', 'beef', 'cheese', 'fast food']
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil and olive oil',
    price: 320,
    originalPrice: 380,
    rating: 4.7,
    reviews: 892,
    restaurant: 'Pizza Palace',
    restaurantId: '2',
    image: '/assets/images/food/Pizza.avif',
    category: 'Pizza',
    cuisine: 'Italian',
    isVeg: true,
    isBestseller: true,
    preparationTime: 20,
    tags: ['pizza', 'italian', 'vegetarian', 'cheese']
  },
  {
    id: '3',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken and spices',
    price: 280,
    originalPrice: 320,
    rating: 4.6,
    reviews: 2156,
    restaurant: 'Spice Route',
    restaurantId: '3',
    image: '/assets/images/food/Biryani.avif',
    category: 'Rice',
    cuisine: 'Indian',
    isVeg: false,
    isBestseller: true,
    preparationTime: 25,
    tags: ['biryani', 'chicken', 'indian', 'rice', 'spicy']
  },
  {
    id: '4',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with caesar dressing and croutons',
    price: 220,
    originalPrice: 260,
    rating: 4.3,
    reviews: 634,
    restaurant: 'Green Leaf',
    restaurantId: '4',
    image: '/assets/images/food/Salad.avif',
    category: 'Salad',
    cuisine: 'Healthy',
    isVeg: true,
    isBestseller: false,
    preparationTime: 10,
    tags: ['salad', 'healthy', 'vegetarian', 'caesar']
  },
  {
    id: '5',
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with vanilla ice cream',
    price: 180,
    originalPrice: 220,
    rating: 4.8,
    reviews: 987,
    restaurant: 'Sweet Dreams',
    restaurantId: '5',
    image: '/assets/images/food/Cake.avif',
    category: 'Dessert',
    cuisine: 'Dessert',
    isVeg: true,
    isBestseller: true,
    preparationTime: 5,
    tags: ['chocolate', 'brownie', 'dessert', 'sweet', 'ice cream']
  },
  {
    id: '6',
    name: 'Paneer Tikka',
    description: 'Marinated paneer cubes grilled to perfection',
    price: 260,
    originalPrice: 300,
    rating: 4.4,
    reviews: 756,
    restaurant: 'Punjabi Tadka',
    restaurantId: '6',
    image: '/assets/images/food/Paneer.avif',
    category: 'Starter',
    cuisine: 'Indian',
    isVeg: true,
    isBestseller: false,
    preparationTime: 15,
    tags: ['paneer', 'tikka', 'indian', 'vegetarian', 'grilled']
  },
  {
    id: '7',
    name: 'Fish Curry',
    description: 'Fresh fish in coconut curry with rice',
    price: 340,
    originalPrice: 400,
    rating: 4.5,
    reviews: 543,
    restaurant: 'Coastal Kitchen',
    restaurantId: '7',
    image: '/assets/images/food/Fish.avif',
    category: 'Main Course',
    cuisine: 'Indian',
    isVeg: false,
    isBestseller: false,
    preparationTime: 20,
    tags: ['fish', 'curry', 'coconut', 'indian', 'seafood']
  },
  {
    id: '8',
    name: 'French Fries',
    description: 'Crispy golden fries with ketchup and mayo',
    price: 120,
    originalPrice: 150,
    rating: 4.2,
    reviews: 1234,
    restaurant: 'Burger Junction',
    restaurantId: '1',
    image: '/assets/images/food/Fries.avif',
    category: 'Side',
    cuisine: 'American',
    isVeg: true,
    isBestseller: false,
    preparationTime: 8,
    tags: ['fries', 'crispy', 'side', 'vegetarian']
  }
];

const categories = [
  'All', 'Pizza', 'Burger', 'Indian', 'Chinese', 'Italian', 'Dessert', 'Beverages'
];

const cuisines = [
  'All', 'Indian', 'Italian', 'Chinese', 'American', 'Mexican', 'Japanese', 'Thai'
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'delivery_time', label: 'Delivery Time' }
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();

  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredFoods, setFilteredFoods] = useState(mockFoods);

  useEffect(() => {
    let filtered = mockFoods;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }

    // Filter by cuisine
    if (selectedCuisine !== 'All') {
      filtered = filtered.filter(food => food.cuisine === selectedCuisine);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'delivery_time':
          return a.preparationTime - b.preparationTime;
        default:
          return b.isBestseller ? 1 : -1;
      }
    });

    setFilteredFoods(filtered);
  }, [searchTerm, selectedCategory, selectedCuisine, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    window.history.replaceState({}, '', `/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedCuisine('All');
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for food, restaurants, or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 px-6 py-3">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cuisine Filter */}
                <div>
                  <h3 className="font-medium mb-3">Cuisine</h3>
                  <div className="space-y-2">
                    {cuisines.map((cuisine) => (
                      <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="cuisine"
                          value={cuisine}
                          checked={selectedCuisine === cuisine}
                          onChange={(e) => setSelectedCuisine(e.target.value)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `Results for "${searchTerm}"` : 'All Foods'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredFoods.length} items found
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Food Grid */}
            {filteredFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFoods.map((food) => (
                  <FoodCard key={food.id} food={food} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}















