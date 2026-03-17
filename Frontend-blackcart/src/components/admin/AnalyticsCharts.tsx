// src/components/admin/AnalyticsCharts.tsx
import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

interface AnalyticsChartsProps {
  salesData: Array<{
    _id: string
    revenue: number
    orders: number
    averageOrderValue: number
  }>
  userGrowth: Array<{
    _id: string
    newUsers: number
    activeUsers: number
  }>
  topProducts: Array<{
    name: string
    revenue: number
    quantity: number
  }>
  revenueByPayment: Array<{
    _id: string
    revenue: number
    orders: number
  }>
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  salesData,
  userGrowth,
  topProducts,
  revenueByPayment,
}) => {
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
  const PAYMENT_COLORS = {
    'cod': '#FFBB28',
    'easypaisa': '#00C49F',
    'jazzcash': '#0088FE',
    'bank_transfer': '#FF8042',
    'card': '#8884d8',
  }

  // Format sales data for charts
  const formattedSalesData = salesData.map(item => ({
    date: item._id,
    revenue: item.revenue,
    orders: item.orders,
    average: item.averageOrderValue,
  }))

  const formattedUserGrowth = userGrowth.map(item => ({
    date: item._id,
    newUsers: item.newUsers,
    activeUsers: item.activeUsers,
  }))

  const formattedTopProducts = topProducts.slice(0, 6).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    revenue: product.revenue,
    quantity: product.quantity,
  }))

  const formattedPaymentData = revenueByPayment.map(payment => ({
    name: payment._id === 'cod' ? 'Cash on Delivery' :
          payment._id === 'easypaisa' ? 'EasyPaisa' :
          payment._id === 'jazzcash' ? 'JazzCash' :
          payment._id === 'bank_transfer' ? 'Bank Transfer' : 'Card',
    value: payment.revenue,
    orders: payment.orders,
    color: PAYMENT_COLORS[payment._id as keyof typeof PAYMENT_COLORS] || '#8884d8',
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('revenue') || entry.name.includes('value') || entry.name.includes('average') 
                ? `PKR ${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Revenue & Orders Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue & Orders Trend</h3>
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Orders</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#666"
                tickFormatter={(value) => `PKR ${value / 1000}k`}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar 
                  dataKey="newUsers" 
                  name="New Users"
                  fill="#0088FE" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="activeUsers" 
                  name="Active Users"
                  fill="#00C49F" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Payment Method</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedPaymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formattedPaymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {formattedPaymentData.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: payment.color }}
                  />
                  <span className="text-sm text-gray-700">{payment.name}</span>
                </div>
                <span className="text-sm font-medium">
                  PKR {payment.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedTopProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="#666"
                tickFormatter={(value) => `PKR ${value / 1000}k`}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#666"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') {
                    return [`PKR ${Number(value).toLocaleString()}`, 'Revenue']
                  }
                  return [value, 'Quantity Sold']
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Revenue"
                fill="#0088FE" 
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="quantity" 
                name="Quantity Sold"
                fill="#00C49F" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-90" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">
            PKR {salesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </p>
          <p className="text-sm opacity-90 mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="h-8 w-8 opacity-90" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Orders</p>
          <p className="text-2xl font-bold">
            {salesData.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
          </p>
          <p className="text-sm opacity-90 mt-2">Completed orders</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-90" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">New Users</p>
          <p className="text-2xl font-bold">
            {userGrowth.reduce((sum, item) => sum + item.newUsers, 0).toLocaleString()}
          </p>
          <p className="text-sm opacity-90 mt-2">This period</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-90" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold">
            PKR {(
              salesData.reduce((sum, item) => sum + item.revenue, 0) / 
              salesData.reduce((sum, item) => sum + item.orders, 1)
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm opacity-90 mt-2">Average per order</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts