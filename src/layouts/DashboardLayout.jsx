import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          
          <main className="flex-1 overflow-auto overflow-x-hidden">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
