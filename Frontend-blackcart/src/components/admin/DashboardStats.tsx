// src/components/admin/DashboardStats.tsx
import React from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    overview: {
      totalUsers: number;
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
      todayOrders: number;
      todayRevenue: number;
      revenueChange: number;
      orderChange: number;
      lowStockProducts: number;
      pendingOrders: number;
    };
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.overview.totalRevenue),
      icon: DollarSign,
      change: stats.overview.revenueChange,
      changeLabel: 'vs yesterday',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.overview.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: stats.overview.orderChange,
      changeLabel: 'vs yesterday',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats.overview.todayRevenue),
      icon: DollarSign,
      change: null,
      changeLabel: 'Today',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Today\'s Orders',
      value: stats.overview.todayOrders.toLocaleString(),
      icon: ShoppingCart,
      change: null,
      changeLabel: 'Today',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Total Users',
      value: stats.overview.totalUsers.toLocaleString(),
      icon: Users,
      change: null,
      changeLabel: 'Registered',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Total Products',
      value: stats.overview.totalProducts.toLocaleString(),
      icon: Package,
      change: null,
      changeLabel: 'Active',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Pending Orders',
      value: stats.overview.pendingOrders.toLocaleString(),
      icon: AlertTriangle,
      change: null,
      changeLabel: 'Need attention',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Low Stock',
      value: stats.overview.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      change: null,
      changeLabel: 'Products',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl p-4 md:p-6 border border-transparent hover:border-gray-300 transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className={`text-2xl md:text-3xl font-bold ${stat.textColor} mb-2`}>
                {stat.value}
              </p>
              <div className="flex items-center">
                {stat.change !== null ? (
                  <>
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                  </>
                ) : null}
                <span className="text-xs text-gray-500 ml-2">{stat.changeLabel}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.iconColor} bg-white/50`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
          
          {/* Progress bar for some stats */}
          {stat.title === 'Low Stock' && stats.overview.lowStockProducts > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Stock Alert</span>
                <span>{Math.round((stats.overview.lowStockProducts / stats.overview.totalProducts) * 100)}% of products</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.bgColor.replace('50', '500')}`}
                  style={{ width: `${Math.min(100, (stats.overview.lowStockProducts / stats.overview.totalProducts) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {stat.title === 'Pending Orders' && stats.overview.pendingOrders > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Require Action</span>
                <span>{Math.round((stats.overview.pendingOrders / stats.overview.totalOrders) * 100)}% of orders</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.bgColor.replace('50', '500')}`}
                  style={{ width: `${Math.min(100, (stats.overview.pendingOrders / stats.overview.totalOrders) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;