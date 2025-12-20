'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Clock, Plus, Minus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  restaurant: string;
  restaurantId: string;
  image: string;
  category: string;
  cuisine: string;
  isVeg: boolean;
  isBestseller: boolean;
  preparationTime: number;
  tags: string[];
}

interface FoodCardProps {
  food: FoodItem;
}

export function FoodCard({ food }: FoodCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, removeFromCart, cartItems } = useCart();

  const cartItem = cartItems.find(item => item.id === food.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      restaurant: food.restaurant,
      quantity: 1,
      isVeg: food.isVeg
    });
  };

  const handleIncrement = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      restaurant: food.restaurant,
      quantity: 1,
      isVeg: food.isVeg
    });
  };

  const handleDecrement = () => {
    removeFromCart(food.id);
  };

  const discount = food.originalPrice
    ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <div className="relative">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={food.image}
            alt={food.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>

          {/* Veg/Non-Veg Badge */}
          <div className="absolute top-3 left-3">
            <div className={`w-4 h-4 rounded-sm border-2 ${
              food.isVeg
                ? 'border-green-500 bg-green-500'
                : 'border-red-500 bg-red-500'
            } flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-white' : 'bg-white'}`} />
            </div>
          </div>

          {/* Bestseller Badge */}
          {food.isBestseller && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-orange-500 text-white">
                Bestseller
              </Badge>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-green-600 text-white">
                {discount}% OFF
              </Badge>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Restaurant Name */}
          <p className="text-sm text-gray-600">{food.restaurant}</p>

          {/* Food Name */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {food.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {food.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium ml-1">{food.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({food.reviews} reviews)</span>
          </div>

          {/* Price and Preparation Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">₹{food.price}</span>
              {food.originalPrice && food.originalPrice > food.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{food.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {food.preparationTime} min
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-2">
            {currentQuantity === 0 ? (
              <Button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={handleDecrement}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[2rem] text-center">
                  {currentQuantity}
                </span>
                <Button
                  onClick={handleIncrement}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}










