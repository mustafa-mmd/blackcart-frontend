import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  Home,
  Folder,
  Star,
  Tag,
  CreditCard,
  Image,
  Megaphone,
  Bell,
  PanelsTopLeft
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Store',
      items: [
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Folder },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Payment Proofs', href: '/admin/payment-proofs', icon: CreditCard },
        { name: 'Reviews', href: '/admin/reviews', icon: Star },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Homepage Banners', href: '/admin/marketing/homepage-banners', icon: Image },
        { name: 'Category Banners', href: '/admin/marketing/category-banners', icon: PanelsTopLeft },
        { name: 'Promotional Banners', href: '', icon: Megaphone, comingSoon: true },
        { name: 'Announcement Bar', href: '', icon: Bell, comingSoon: true },
        { name: 'Popups', href: '', icon: PanelsTopLeft, comingSoon: true },
      ],
    },
    {
      title: 'Insights',
      items: [
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];
  const navigation = navigationSections.flatMap(section => section.items).filter(item => item.href);

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
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col overflow-y-auto">
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
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const active = item.href ? isActive(item.href) : false;
                  const Icon = item.icon;

                  if (item.comingSoon) {
                    return (
                      <button
                        key={item.name}
                        type="button"
                        disabled
                        className="flex w-full cursor-not-allowed items-center px-4 py-3 text-left text-sm font-medium text-gray-400 rounded-lg opacity-75"
                        title="Coming soon"
                      >
                        <Icon className="h-5 w-5 mr-3 text-gray-300" />
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          Soon
                        </span>
                      </button>
                    );
                  }

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
                      <Icon className={`h-5 w-5 mr-3 ${
                        active ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      {active && (
                        <ChevronRight className="h-4 w-4 ml-auto text-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
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

      {/* Main content area - Takes remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header - Sticky within this container */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 z-10">
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

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


