import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, IndianRupee } from 'lucide-react';
import Image from 'next/image';

// Mock data for restaurants
const restaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.5,
    deliveryTime: '25-30 mins',
    deliveryFee: 40,
    image: '/assets/images/hero/Sushi_replace.avif',
    isOpen: true,
    discount: '50% OFF',
    tags: ['Pure Veg', 'Trending']
  },
  {
    id: '2',
    name: 'Burger Junction',
    cuisine: ['American', 'Fast Food'],
    rating: 4.2,
    deliveryTime: '20-25 mins',
    deliveryFee: 30,
    image: '/assets/images/hero/Veggies_new.avif',
    isOpen: true,
    discount: '30% OFF',
    tags: ['Non-Veg', 'Best Seller']
  },
  {
    id: '3',
    name: 'Taco Fiesta',
    cuisine: ['Mexican'],
    rating: 4.7,
    deliveryTime: '30-35 mins',
    deliveryFee: 50,
    image: '/assets/images/hero/Sushi_replace.avif',
    isOpen: true,
    discount: '40% OFF',
    tags: ['Veg', 'Mexican']
  },
  {
    id: '4',
    name: 'Sushi Express',
    cuisine: ['Japanese', 'Asian'],
    rating: 4.8,
    deliveryTime: '35-40 mins',
    deliveryFee: 60,
    image: '/assets/images/hero/Veggies_new.avif',
    isOpen: true,
    discount: '25% OFF',
    tags: ['Non-Veg', 'Premium']
  },
  {
    id: '5',
    name: 'Curry House',
    cuisine: ['Indian'],
    rating: 4.3,
    deliveryTime: '25-30 mins',
    deliveryFee: 35,
    image: '/assets/images/hero/Sushi_replace.avif',
    isOpen: true,
    discount: '35% OFF',
    tags: ['Veg', 'Indian']
  },
  {
    id: '6',
    name: 'Pasta Corner',
    cuisine: ['Italian'],
    rating: 4.6,
    deliveryTime: '20-25 mins',
    deliveryFee: 45,
    image: '/assets/images/hero/Veggies_new.avif',
    isOpen: true,
    discount: '20% OFF',
    tags: ['Veg', 'Italian']
  }
];

export function RestaurantGrid() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Top restaurants near you
            </h2>
            <p className="text-gray-600 text-lg">
              Discover the best restaurants in your area
            </p>
          </div>
          <button className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors">
            See all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <Card
              key={restaurant.id}
              className="overflow-hidden hover:shadow-2xl card-hover cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-white font-semibold shadow-lg">
                    {restaurant.discount}
                  </Badge>
                </div>

                {/* Status */}
                <div className="absolute top-3 right-3">
                  <Badge className={`text-white font-medium ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="absolute bottom-3 left-3 flex space-x-2">
                  {restaurant.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-green-600 fill-current" />
                    <span className="text-sm font-medium text-green-700">{restaurant.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  {restaurant.cuisine.join(', ')}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IndianRupee className="h-4 w-4" />
                    <span>{restaurant.deliveryFee} delivery fee</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all btn-hover-lift">
            Load More Restaurants
          </button>
        </div>
      </div>
    </section>
  );
}
