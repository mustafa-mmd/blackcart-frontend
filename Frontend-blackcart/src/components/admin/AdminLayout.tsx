import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'; // ✅ Added Outlet
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Home,
  Folder,
  Star,
  Tag,
  CreditCard
} from 'lucide-react';

// ✅ Changed: Remove children prop since we're using Outlet
const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Folder },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payment Proofs', href: '/admin/payment-proofs', icon: CreditCard },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const activePage = navigation.find(item => isActive(item.href));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BlackCart Admin</h1>
                <p className="text-xs text-gray-500">E-commerce Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    active ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                  {active && (
                    <ChevronRight className="h-4 w-4 ml-auto text-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activePage?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Manage your e-commerce store
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">Admin</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Render Outlet for nested routes */}
        <main className="flex-1">
          <div className="p-4 md:p-6">
            {/* ✅ Changed: Use Outlet instead of children */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;