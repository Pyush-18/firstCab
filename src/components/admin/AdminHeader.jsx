import React from 'react';
import { Menu, X, Bell, Sun, Moon, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const AdminHeader = ({ darkMode, toggleTheme, cardClasses, setSidebarOpen, sidebarOpen }) => {
  const navigate = useNavigate();
  return (
    <header className={`fixed top-0 left-0 right-0 h-16 ${cardClasses} border-b z-50 flex items-center justify-between px-4 lg:px-6`}>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="lg:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Car className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold">FirstCab Admin</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell  size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center font-semibold cursor-pointer`}>
          AD
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;