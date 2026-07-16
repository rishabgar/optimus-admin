import { useState, useEffect } from 'react'
import {
  Users,
  Store,
  Layers,
  Tags,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { dashboardService, orderService, sellerService } from '../../services'
import toast from 'react-hot-toast'

// Curated harmonious colors for dark and light mode
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const MOCK_STATS = {
  totalSellers: 142,
  totalCustomers: 2840,
  totalShopTypes: 5,
  totalCategories: 48,
  totalProducts: 1205,
  totalOrders: 652,
  completedOrders: 512,
  pendingOrders: 118,
  cancelledOrders: 22,
  totalRevenue: 245900,
}

const MOCK_ORDER_CHART = [
  { month: 'Jan', orders: 45, revenue: 15000 },
  { month: 'Feb', orders: 58, revenue: 21000 },
  { month: 'Mar', orders: 72, revenue: 26000 },
  { month: 'Apr', orders: 60, revenue: 20000 },
  { month: 'May', orders: 88, revenue: 32000 },
  { month: 'Jun', orders: 110, revenue: 41000 },
  { month: 'Jul', orders: 135, revenue: 50900 },
]

const MOCK_SELLER_PERFORMANCE = [
  { name: 'Fresh Market', sales: 120 },
  { name: 'ElectroZone', sales: 98 },
  { name: 'PharmaPlus', sales: 86 },
  { name: 'TastyBites', sales: 74 },
  { name: 'ChicBoutique', sales: 50 },
]

const MOCK_CATEGORY_DISTRIBUTION = [
  { name: 'Grocery', value: 450 },
  { name: 'Electronics', value: 310 },
  { name: 'Pharmacy', value: 180 },
  { name: 'Restaurant', value: 160 },
  { name: 'Fashion', value: 105 },
]

const MOCK_RECENT_ORDERS = [
  { id: 'ORD-8941', customer: 'Rohan Sharma', shop: 'Fresh Market', amount: 1250, status: 'delivered', date: '2026-07-14' },
  { id: 'ORD-8940', customer: 'Priya Patel', shop: 'ElectroZone', amount: 18999, status: 'pending', date: '2026-07-14' },
  { id: 'ORD-8939', customer: 'Aman Verma', shop: 'PharmaPlus', amount: 450, status: 'processing', date: '2026-07-13' },
  { id: 'ORD-8938', customer: 'Sneha Rao', shop: 'TastyBites', amount: 890, status: 'delivered', date: '2026-07-13' },
  { id: 'ORD-8937', customer: 'Vikram Singh', shop: 'ChicBoutique', amount: 3200, status: 'cancelled', date: '2026-07-12' },
]

const MOCK_RECENT_SELLERS = [
  { name: 'Organic Greens', email: 'organic@greens.com', shop: 'Organic Greens Store', type: 'Grocery', date: '2026-07-14' },
  { name: 'Gadget Hub', email: 'gadgets@hub.com', shop: 'Gadget Hub Express', type: 'Electronics', date: '2026-07-13' },
  { name: 'Curry Palace', email: 'curry@palace.com', shop: 'Curry Palace Restaurant', type: 'Restaurant', date: '2026-07-12' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [recentOrders, setRecentOrders] = useState(MOCK_RECENT_ORDERS)
  const [recentSellers, setRecentSellers] = useState(MOCK_RECENT_SELLERS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        // Try fetching actual stats from backend
        const statsRes = await dashboardService.getStats()
        if (statsRes?.data?.data) {
          setStats(statsRes.data.data)
        }
      } catch (err) {
        console.warn('Dashboard stats API endpoint not found or failed, falling back to mock metrics.')
      }

      try {
        // Try to load actual latest orders and sellers
        const ordersRes = await orderService.getAll({ page_no: 1, limit: 5 })
        if (ordersRes?.data?.data?.orders) {
          setRecentOrders(ordersRes.data.data.orders.slice(0, 5))
        }
        
        const sellersRes = await sellerService.getAll({ page_no: 1, limit: 3 })
        if (sellersRes?.data?.data?.users) {
          setRecentSellers(sellersRes.data.data.users.slice(0, 3).map(u => ({
            name: `${u.first_name} ${u.last_name || ''}`,
            email: u.user_email,
            shop: u.shop_name || 'No Shop',
            type: u.shop_type || 'Retail',
            date: new Date(u.createdAt).toISOString().slice(0, 10),
          })))
        }
      } catch (err) {
        console.warn('Recent activities endpoints failed, using mock data.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const statCards = [
    { label: 'Total Sellers', value: stats.totalSellers, icon: Store, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Shop Types', value: stats.totalShopTypes, icon: FileText, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Categories', value: stats.totalCategories, icon: Tags, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
    { label: 'Products', value: stats.totalProducts, icon: Layers, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  ]

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome to the OptimusKart administrative control room. Here is your store metrics summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {isLoading ? (
                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Widget */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Revenue</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-1" />
            +18.2% MoM
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_ORDER_CHART}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
              <XAxis dataKey="month" className="text-xs text-gray-500" stroke="#888888" />
              <YAxis className="text-xs text-gray-500" stroke="#888888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders Overview Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Monthly Order Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ORDER_CHART}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#888888" className="text-xs" />
                <YAxis stroke="#888888" className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Popular Shop Types Share</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MOCK_CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {MOCK_CATEGORY_DISTRIBUTION.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value} products</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Latest Orders */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm xl:col-span-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Latest Orders Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentOrders.map((order, idx) => (
                  <tr key={order.id || order._id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3.5 text-sm font-semibold text-accent">{order.id || order._id}</td>
                    <td className="py-3.5 text-sm text-gray-700 dark:text-gray-300">{order.customer || order.user_email}</td>
                    <td className="py-3.5 text-sm font-medium text-gray-900 dark:text-white">₹{order.amount || order.total_price}</td>
                    <td className="py-3.5 text-sm">{getStatusBadge(order.status || 'pending')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Registered Sellers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">New Sellers</h3>
          <div className="space-y-4">
            {recentSellers.map((seller, idx) => (
              <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                  {seller.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{seller.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{seller.shop}</p>
                  <p className="text-[10px] text-accent font-semibold mt-0.5 uppercase tracking-wider">{seller.type}</p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{seller.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
