'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

// Mock restaurant data with menu items
const mockRestaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    image: '/assets/images/food/Biryani.avif',
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

const menuCategories = ['Pizza', 'Burger', 'Rice', 'Main Course', 'Starter', 'Dessert', 'Beverage'];

export default function RestaurantMenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    isVeg: true,
    isAvailable: true,
    image: '',
    preparationTime: ''
  });

  useEffect(() => {
    // Find restaurant by ID
    const foundRestaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (foundRestaurant) {
      setRestaurant(foundRestaurant);
      setMenuItems(foundRestaurant.menu);
    }
  }, [restaurantId]);

  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      const isAvailable = availabilityFilter === 'available';
      filtered = filtered.filter(item => item.isAvailable === isAvailable);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMenuItems(filtered);
  }, [menuItems, categoryFilter, availabilityFilter, searchQuery]);

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.category) return;

    const item = {
      id: Date.now().toString(),
      ...newMenuItem,
      price: parseInt(newMenuItem.price),
      originalPrice: newMenuItem.originalPrice ? parseInt(newMenuItem.originalPrice) : null,
      preparationTime: parseInt(newMenuItem.preparationTime) || 15
    };

    setMenuItems([...menuItems, item]);

    // Update restaurant data
    setRestaurant(prev => ({
      ...prev,
      menu: [...prev.menu, item]
    }));

    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      isVeg: true,
      isAvailable: true,
      image: '',
      preparationTime: ''
    });
    setIsAddItemOpen(false);
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setNewMenuItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      originalPrice: item.originalPrice?.toString() || '',
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image,
      preparationTime: item.preparationTime.toString()
    });
    setIsAddItemOpen(true);
  };

  const handleUpdateMenuItem = () => {
    if (!editingItem) return;

    const updatedItem = {
      ...editingItem,
      ...newMenuItem,
      price: parseInt(newMenuItem.price),
      originalPrice: newMenuItem.originalPrice ? parseInt(newMenuItem.originalPrice) : null,
      preparationTime: parseInt(newMenuItem.preparationTime) || 15
    };

    const updatedMenuItems = menuItems.map(item =>
      item.id === editingItem.id ? updatedItem : item
    );

    setMenuItems(updatedMenuItems);

    // Update restaurant data
    setRestaurant(prev => ({
      ...prev,
      menu: updatedMenuItems
    }));

    setEditingItem(null);
    setIsAddItemOpen(false);
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      isVeg: true,
      isAvailable: true,
      image: '',
      preparationTime: ''
    });
  };

  const handleDeleteMenuItem = (itemId) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const updatedMenuItems = menuItems.filter(item => item.id !== itemId);
      setMenuItems(updatedMenuItems);

      // Update restaurant data
      setRestaurant(prev => ({
        ...prev,
        menu: updatedMenuItems
      }));
    }
  };

  const toggleItemAvailability = (itemId) => {
    const updatedMenuItems = menuItems.map(item =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );

    setMenuItems(updatedMenuItems);

    // Update restaurant data
    setRestaurant(prev => ({
      ...prev,
      menu: updatedMenuItems
    }));
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  width={50}
                  height={50}
                  className="rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                  <p className="text-gray-600">Menu Management</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsAddItemOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {menuCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Menu Items ({filteredMenuItems.length})
          </h2>
        </div>

        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first menu item to get started'}
            </p>
            <Button onClick={() => setIsAddItemOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMenuItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Price and Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Veg/Non-Veg indicator */}
                      <div className={`w-4 h-4 rounded-sm border-2 ${
                        item.isVeg
                          ? 'border-green-500 bg-green-500'
                          : 'border-red-500 bg-red-500'
                      } flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      {/* Availability Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`text-xs px-2 py-1 ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>

                  {/* Preparation Time */}
                  <div className="text-sm text-gray-600">
                    Preparation time: {item.preparationTime} min
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Menu Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newMenuItem.category}
                  onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  placeholder="299"
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={newMenuItem.originalPrice}
                  onChange={(e) => setNewMenuItem({...newMenuItem, originalPrice: e.target.value})}
                  placeholder="399"
                />
              </div>
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={newMenuItem.preparationTime}
                  onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: e.target.value})}
                  placeholder="20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={newMenuItem.image}
                onChange={(e) => setNewMenuItem({...newMenuItem, image: e.target.value})}
                placeholder="/assets/images/food/..."
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVeg"
                  checked={newMenuItem.isVeg}
                  onChange={(e) => setNewMenuItem({...newMenuItem, isVeg: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={newMenuItem.isAvailable}
                  onChange={(e) => setNewMenuItem({...newMenuItem, isAvailable: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isAvailable">Available</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddItemOpen(false);
                  setEditingItem(null);
                  setNewMenuItem({
                    name: '',
                    description: '',
                    price: '',
                    originalPrice: '',
                    category: '',
                    isVeg: true,
                    isAvailable: true,
                    image: '',
                    preparationTime: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingItem ? handleUpdateMenuItem : handleAddMenuItem}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


















