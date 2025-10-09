import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2, Search, Filter, Eye, MapPin, Calendar, RefreshCw } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/apiService';
import Swal from 'sweetalert2';

function BusManagementPage() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const hasLoadedRef = useRef(false);

  // Load buses data on component mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBuses();
    }
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const response = await api.bus.getBuses();
      
      // Ensure buses is always an array
      const busesData = Array.isArray(response) ? response : 
                       response?.data ? response.data : 
                       response?.buses ? response.buses : [];
      
      setBuses(busesData);
    } catch (error) {
      console.error('Error loading buses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load buses data.',
        confirmButtonText: 'OK'
      });
      // Set empty array on error to prevent filter errors
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for buses (fallback if API fails)
  const mockBuses = [
    {
      id: 1,
      busName: 'Mountain Express',
      busNumber: 'BT-001',
      busType: 'Standard',
      totalSeats: 50,
      description: 'Comfortable standard bus with basic amenities for daily commute',
      amenities: 'AC, WiFi, Water',
      status: 'active',
      registeredDate: '2024-01-15',
      lastService: '2024-01-10',
      nextService: '2024-02-10'
    },
    {
      id: 2,
      busName: 'Royal Transport',
      busNumber: 'BT-002',
      busType: 'Deluxe',
      totalSeats: 40,
      description: 'Premium deluxe bus with enhanced comfort and luxury amenities',
      amenities: 'AC, WiFi, Water, Snacks',
      status: 'active',
      registeredDate: '2024-01-20',
      lastService: '2024-01-18',
      nextService: '2024-02-18'
    },
    {
      id: 3,
      busName: 'Himalayan Express',
      busNumber: 'BT-003',
      busType: 'Standard',
      totalSeats: 45,
      description: 'Reliable standard bus perfect for mountain routes',
      amenities: 'AC, Water',
      status: 'maintenance',
      registeredDate: '2024-01-25',
      lastService: '2024-01-22',
      nextService: '2024-02-22'
    },
    {
      id: 4,
      busName: 'Thunder Express',
      busNumber: 'BT-004',
      busType: 'Luxury',
      totalSeats: 35,
      description: 'Luxury bus with premium amenities and comfort',
      amenities: 'AC, WiFi, Water, Snacks, Entertainment',
      status: 'inactive',
      registeredDate: '2024-02-01',
      lastService: '2024-01-28',
      nextService: '2024-02-28'
    }
  ];

  // Use API data if available, otherwise fallback to mock data
  const displayBuses = buses.length > 0 ? buses : mockBuses;

  const filteredBuses = Array.isArray(displayBuses) ? displayBuses.filter(bus => {
    if (!bus || typeof bus !== 'object') return false;
    const matchesSearch = (bus.busName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || bus.busType === filterType;
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) : [];

  const handleEditBus = (bus) => {
    console.log('Edit bus:', bus);
    // TODO: Implement edit functionality
  };

  const handleDeleteBus = (bus) => {
    if (confirm(`Are you sure you want to delete ${bus.busName} (${bus.busNumber})?`)) {
      console.log('Delete bus:', bus);
      // TODO: Implement delete functionality
    }
  };

  const handleViewBus = (bus) => {
    navigate(`/dashboard/bus/details/${bus.id}`, { state: { bus } });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', label: 'Active' },
      maintenance: { variant: 'secondary', label: 'Maintenance' },
      inactive: { variant: 'outline', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <PageWrapper title="Bus Management" description="Loading buses...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading buses...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Bus Management" 
      description="Manage existing buses in your fleet."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Buses
            </CardTitle>
            <CardDescription>
              Find and filter buses in your fleet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterType">Bus Type</Label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="AC">AC Bus</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buses List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Fleet Overview
                </CardTitle>
                <CardDescription>
                  {filteredBuses.length} of {displayBuses.length} buses found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBuses.map((bus) => (
                <Card key={bus.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{bus.busName}</h3>
                          <Badge variant="outline">{bus.busType}</Badge>
                          <Badge variant="secondary">{bus.busNumber}</Badge>
                          {getStatusBadge(bus.status)}
                        </div>
                        
                        <p className="text-muted-foreground text-sm">{bus.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {bus.amenities.split(', ').map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity.trim()}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Seats</p>
                            <p className="font-medium">{bus.totalSeats}</p>
                          </div>
                          {/* <div>
                            <p className="text-muted-foreground">Registered</p>
                            <p className="font-medium">{new Date(bus.registeredDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Service</p>
                            <p className="font-medium">{new Date(bus.lastService).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Service</p>
                            <p className="font-medium">{new Date(bus.nextService).toLocaleDateString()}</p>
                          </div> */}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBus(bus)}
                          title="View Routes & Schedules"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBus(bus)}
                          title="Edit Bus Details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBus(bus)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Bus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredBuses.length === 0 && (
                <div className="text-center py-12">
                  <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No buses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by adding your first bus to the fleet.'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Bus
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default BusManagementPage;
