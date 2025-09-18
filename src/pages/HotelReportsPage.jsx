import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, DollarSign, Filter } from 'lucide-react';

const HotelReportsPage = () => {
  const [reportCriteria, setReportCriteria] = useState({
    reportType: '',
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    hotel: '',
    roomType: '',
    status: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleInputChange = (field, value) => {
    setReportCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    if (!reportCriteria.reportType) {
      alert('Please select a report type');
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock report data
      const mockReport = {
        type: reportCriteria.reportType,
        generatedAt: new Date().toISOString(),
        data: generateMockData(reportCriteria.reportType)
      };
      
      setGeneratedReport(mockReport);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockData = (reportType) => {
    switch (reportType) {
      case 'booking-summary':
        return {
          totalBookings: 156,
          confirmedBookings: 142,
          pendingBookings: 8,
          cancelledBookings: 6,
          totalRevenue: 45680,
          averageBookingValue: 293,
          occupancyRate: 78.5
        };
      case 'revenue-analysis':
        return {
          totalRevenue: 45680,
          roomRevenue: 38920,
          serviceRevenue: 6760,
          monthlyBreakdown: [
            { month: 'Jan', revenue: 15200 },
            { month: 'Feb', revenue: 16800 },
            { month: 'Mar', revenue: 13680 }
          ],
          topRevenueSources: [
            { source: 'Room Bookings', revenue: 38920, percentage: 85.2 },
            { source: 'Room Service', revenue: 3420, percentage: 7.5 },
            { source: 'Spa Services', revenue: 2340, percentage: 5.1 },
            { source: 'Restaurant', revenue: 1000, percentage: 2.2 }
          ]
        };
      case 'guest-analysis':
        return {
          totalGuests: 312,
          repeatGuests: 89,
          newGuests: 223,
          averageStayDuration: 2.3,
          guestSatisfaction: 4.6,
          topGuestCountries: [
            { country: 'United States', guests: 156, percentage: 50 },
            { country: 'Canada', guests: 78, percentage: 25 },
            { country: 'United Kingdom', guests: 47, percentage: 15 },
            { country: 'Germany', guests: 31, percentage: 10 }
          ]
        };
      case 'occupancy-report':
        return {
          averageOccupancy: 78.5,
          peakOccupancy: 95.2,
          lowOccupancy: 45.8,
          roomUtilization: [
            { roomType: 'Standard Room', occupancy: 82.3, revenue: 15200 },
            { roomType: 'Deluxe Room', occupancy: 76.8, revenue: 18900 },
            { roomType: 'Suite', occupancy: 65.4, revenue: 14820 }
          ],
          seasonalTrends: [
            { period: 'Q1', occupancy: 72.1 },
            { period: 'Q2', occupancy: 81.5 },
            { period: 'Q3', occupancy: 85.2 },
            { period: 'Q4', occupancy: 75.8 }
          ]
        };
      default:
        return {};
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const dataStr = JSON.stringify(generatedReport.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportCriteria.reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { value: 'booking-summary', label: 'Booking Summary Report' },
    { value: 'revenue-analysis', label: 'Revenue Analysis Report' },
    { value: 'guest-analysis', label: 'Guest Analysis Report' },
    { value: 'occupancy-report', label: 'Occupancy Report' },
    { value: 'cancellation-analysis', label: 'Cancellation Analysis' },
    { value: 'room-performance', label: 'Room Performance Report' }
  ];

  const dateRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const hotels = [
    'Grand Hotel Plaza',
    'Luxury Resort & Spa',
    'Business Hotel Center',
    'Boutique Hotel Downtown'
  ];

  const roomTypes = [
    'Standard Room',
    'Deluxe Room',
    'Executive Room',
    'Suite',
    'Presidential Suite'
  ];

  const statuses = [
    'confirmed',
    'pending',
    'cancelled',
    'completed'
  ];

  return (
    <div className="container mx-auto p-0 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Generate Reports</h1>
          <p className="text-muted-foreground">Generate booking reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure the parameters for your report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select
                value={reportCriteria.reportType}
                onValueChange={(value) => handleInputChange('reportType', value)}
              >
                <option value="">Select report type</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select
                value={reportCriteria.dateRange}
                onValueChange={(value) => handleInputChange('dateRange', value)}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel</Label>
              <Select
                value={reportCriteria.hotel}
                onValueChange={(value) => handleInputChange('hotel', value)}
              >
                <option value="">All hotels</option>
                {hotels.map(hotel => (
                  <option key={hotel} value={hotel}>{hotel}</option>
                ))}
              </Select>
            </div>

            {reportCriteria.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportCriteria.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportCriteria.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Select
                value={reportCriteria.roomType}
                onValueChange={(value) => handleInputChange('roomType', value)}
              >
                <option value="">All room types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={reportCriteria.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <option value="">All statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {reportTypes.find(t => t.value === generatedReport.type)?.label}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Report Summary Cards */}
              {generatedReport.type === 'booking-summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Bookings</span>
                      </div>
                      <p className="text-2xl font-bold">{generatedReport.data.totalBookings}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Confirmed</span>
                      </div>
                      <p className="text-2xl font-bold">{generatedReport.data.confirmedBookings}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Total Revenue</span>
                      </div>
                      <p className="text-2xl font-bold">${generatedReport.data.totalRevenue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Occupancy Rate</span>
                      </div>
                      <p className="text-2xl font-bold">{generatedReport.data.occupancyRate}%</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Revenue Analysis */}
              {generatedReport.type === 'revenue-analysis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold">${generatedReport.data.totalRevenue.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Room Revenue</span>
                        </div>
                        <p className="text-2xl font-bold">${generatedReport.data.roomRevenue.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Service Revenue</span>
                        </div>
                        <p className="text-2xl font-bold">${generatedReport.data.serviceRevenue.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Top Revenue Sources</h3>
                    <div className="space-y-2">
                      {generatedReport.data.topRevenueSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{source.source}</span>
                          <div className="text-right">
                            <p className="font-semibold">${source.revenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Analysis */}
              {generatedReport.type === 'guest-analysis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Total Guests</span>
                        </div>
                        <p className="text-2xl font-bold">{generatedReport.data.totalGuests}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Repeat Guests</span>
                        </div>
                        <p className="text-2xl font-bold">{generatedReport.data.repeatGuests}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Satisfaction</span>
                        </div>
                        <p className="text-2xl font-bold">{generatedReport.data.guestSatisfaction}/5</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Top Guest Countries</h3>
                    <div className="space-y-2">
                      {generatedReport.data.topGuestCountries.map((country, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{country.country}</span>
                          <div className="text-right">
                            <p className="font-semibold">{country.guests} guests</p>
                            <p className="text-sm text-muted-foreground">{country.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Data */}
              <div className="space-y-4">
                <h3 className="font-semibold">Report Data</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(generatedReport.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotelReportsPage;
