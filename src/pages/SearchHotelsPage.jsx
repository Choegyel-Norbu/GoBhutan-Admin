import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Search, MapPin, Calendar, Users, Star, Filter, Bed, Wifi, Car } from 'lucide-react';

const SearchHotelsPage = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    rooms: 1,
    priceRange: '',
    starRating: '',
    amenities: []
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setSearchCriteria(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results
      const mockResults = [
        {
          id: 1,
          name: 'Grand Hotel Plaza',
          location: 'Downtown City Center',
          rating: 4.5,
          price: 299,
          currency: 'USD',
          image: '/api/placeholder/300/200',
          amenities: ['wifi', 'parking', 'pool', 'gym'],
          rooms: [
            { type: 'Standard Room', price: 299, available: 5 },
            { type: 'Deluxe Room', price: 399, available: 3 },
            { type: 'Suite', price: 599, available: 2 }
          ]
        },
        {
          id: 2,
          name: 'Luxury Resort & Spa',
          location: 'Beachfront Paradise',
          rating: 4.8,
          price: 499,
          currency: 'USD',
          image: '/api/placeholder/300/200',
          amenities: ['wifi', 'parking', 'pool', 'spa', 'restaurant'],
          rooms: [
            { type: 'Ocean View Room', price: 499, available: 4 },
            { type: 'Beachfront Suite', price: 799, available: 2 },
            { type: 'Presidential Suite', price: 1299, available: 1 }
          ]
        },
        {
          id: 3,
          name: 'Business Hotel Center',
          location: 'Financial District',
          rating: 4.2,
          price: 199,
          currency: 'USD',
          image: '/api/placeholder/300/200',
          amenities: ['wifi', 'parking', 'business-center'],
          rooms: [
            { type: 'Business Room', price: 199, available: 8 },
            { type: 'Executive Room', price: 299, available: 4 },
            { type: 'Conference Suite', price: 399, available: 2 }
          ]
        },
        {
          id: 4,
          name: 'Boutique Hotel Downtown',
          location: 'Historic District',
          rating: 4.6,
          price: 249,
          currency: 'USD',
          image: '/api/placeholder/300/200',
          amenities: ['wifi', 'restaurant', 'bar'],
          rooms: [
            { type: 'Boutique Room', price: 249, available: 6 },
            { type: 'Historic Suite', price: 349, available: 3 }
          ]
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const amenities = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'pool', label: 'Swimming Pool', icon: Bed },
    { id: 'gym', label: 'Fitness Center', icon: Bed },
    { id: 'spa', label: 'Spa Services', icon: Bed },
    { id: 'restaurant', label: 'Restaurant', icon: Bed },
    { id: 'bar', label: 'Bar', icon: Bed },
    { id: 'business-center', label: 'Business Center', icon: Bed }
  ];

  const priceRanges = [
    'Under $100',
    '$100 - $200',
    '$200 - $300',
    '$300 - $500',
    '$500 - $1000',
    'Over $1000'
  ];

  const starRatings = [
    '1 Star',
    '2 Stars',
    '3 Stars',
    '4 Stars',
    '5 Stars'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Search Hotels</h1>
          <p className="text-muted-foreground">Find available hotels</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Criteria
          </CardTitle>
          <CardDescription>
            Enter your search criteria to find the perfect hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Basic Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={searchCriteria.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, hotel name, or landmark"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="checkInDate"
                    type="date"
                    value={searchCriteria.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={searchCriteria.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adults</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={searchCriteria.adults}
                    onChange={(e) => handleInputChange('adults', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={searchCriteria.children}
                  onChange={(e) => handleInputChange('children', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={searchCriteria.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Select
                  value={searchCriteria.priceRange}
                  onValueChange={(value) => handleInputChange('priceRange', value)}
                >
                  <option value="">Any price</option>
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Star Rating</Label>
                <Select
                  value={searchCriteria.starRating}
                  onValueChange={(value) => handleInputChange('starRating', value)}
                >
                  <option value="">Any rating</option>
                  {starRatings.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenities.map(amenity => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity.id}
                      checked={searchCriteria.amenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={amenity.id} className="text-sm">
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search Hotels'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Search Results ({searchResults.length} hotels found)
            </h2>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or dates
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map(hotel => (
                <Card key={hotel.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{hotel.name}</h3>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {hotel.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          ${hotel.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /night
                          </span>
                        </span>
                        <Button>View Details</Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Available Rooms:</h4>
                        {hotel.rooms.map((room, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{room.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">${room.price}</span>
                              <span className="text-muted-foreground">
                                ({room.available} available)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map(amenity => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                          >
                            {amenity.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHotelsPage;
