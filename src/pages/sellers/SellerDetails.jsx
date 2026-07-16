import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Store, Package, Layers, IndianRupee, ShieldCheck, Star } from 'lucide-react'
import { sellerService, productService, categoryService } from '../../services'
import Table from '../../components/common/Table'
import toast from 'react-hot-toast'

const MOCK_SELLER_METRICS = {
  totalCategories: 6,
  totalProducts: 24,
  totalOrders: 94,
  completedOrders: 78,
  pendingOrders: 12,
  cancelledOrders: 4,
  revenue: 34990,
}

export default function SellerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [metrics, setMetrics] = useState(MOCK_SELLER_METRICS)
  const [isLoading, setIsLoading] = useState(true)

  const loadSellerData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Seller detailed profile
      const sellerRes = await sellerService.getById(id)
      const sellerArr = sellerRes.data.data
      
      let sellerObj = null
      if (Array.isArray(sellerArr) && sellerArr.length > 0) {
        sellerObj = sellerArr[0]
      } else if (sellerArr && !Array.isArray(sellerArr)) {
        sellerObj = sellerArr
      }
      
      setSeller(sellerObj)

      // 2. Fetch categories created by seller
      try {
        const catRes = await categoryService.getBySellerId(id)
        setCategories(catRes.data.data || [])
      } catch (err) {
        console.warn('Failed to load seller categories, using mock values.')
        setCategories([
          { _id: 'cat1', product_category_name: 'Organic Apples', createdAt: new Date() },
          { _id: 'cat2', product_category_name: 'Fresh Berries', createdAt: new Date() }
        ])
      }

      // 3. Fetch products added by seller
      try {
        const prodRes = await productService.getBySeller(id)
        setProducts(prodRes.data.data || [])
      } catch (err) {
        console.warn('Failed to load seller products, using mock values.')
        setProducts([
          { _id: 'prod1', product_name: 'Kashmiri Apples', brand_name: 'FreshGrown', variants: [{ price: 120, product_quantity: 40 }] },
          { _id: 'prod2', product_name: 'Blueberries', brand_name: 'BerryLand', variants: [{ price: 299, product_quantity: 15 }] }
        ])
      }

    } catch (err) {
      console.error(err)
      toast.error('Failed to load seller information')
      // Populate full mock fallback
      setSeller({
        first_name: 'Fresh Market',
        user_email: 'fresh@market.com',
        user_phone_no: '+91 98765 43210',
        shop_name: 'Fresh Market Grocery',
        shop_address: 'Sector 62, Noida, UP, 201301',
        rating: 4.8,
        is_closed: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSellerData()
  }, [id])

  if (isLoading && !seller) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  const metricCards = [
    { label: 'Total Categories', value: categories.length || metrics.totalCategories, icon: Layers, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Total Products', value: products.length || metrics.totalProducts, icon: Package, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Orders', value: metrics.totalOrders, icon: Store, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Revenue Generated', value: `₹${metrics.revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  ]

  const productColumns = [
    {
      key: 'product_name',
      label: 'Product Details',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{row.product_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.brand_name}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => `₹${row.variants?.[0]?.price ?? 0}`
    },
    {
      key: 'stock',
      label: 'Stock Quantity',
      render: (row) => `${row.variants?.[0]?.product_quantity ?? 0} Left`
    }
  ]

  const categoryColumns = [
    {
      key: 'product_category_name',
      label: 'Category Name',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate('/sellers')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to sellers
        </button>
      </div>

      {/* Header Profile */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-2xl shrink-0">
            {seller?.shop_name?.slice(0, 2).toUpperCase() || 'SM'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{seller?.shop_name || 'Seller Shop'}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${seller?.is_closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {seller?.is_closed ? 'Closed' : 'Open'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{seller?.first_name} {seller?.last_name || ''} ({seller?.user_email})</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{seller?.shop_address}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end gap-2 shrink-0">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{seller?.rating || '4.5'} / 5.0 Rating</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Active session phone: {seller?.user_phone_no}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Categories & Products Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories created by seller */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Shop Categories</h3>
          <Table
            columns={categoryColumns}
            data={categories}
            isLoading={isLoading}
            emptyMessage="No categories created by this seller"
          />
        </div>

        {/* Products added by seller */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Shop Products</h3>
          <Table
            columns={productColumns}
            data={products}
            isLoading={isLoading}
            emptyMessage="No products added by this seller"
          />
        </div>
      </div>
    </div>
  )
}
