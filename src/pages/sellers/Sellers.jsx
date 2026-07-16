import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, ArrowRight, ShieldCheck, Ban } from 'lucide-react'
import { sellerService } from '../../services'
import Table from '../../components/common/Table'
import toast from 'react-hot-toast'

export default function Sellers() {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadSellers = async () => {
    setIsLoading(true)
    try {
      const response = await sellerService.getAll({
        page_no: currentPage,
        search: searchQuery
      })
      
      const payload = response.data.data || []
      
      if (Array.isArray(payload)) {
        setSellers(payload)
        setTotalPages(1)
      } else if (payload.users) {
        setSellers(payload.users)
        setTotalPages(payload.totalPages || 1)
      } else {
        setSellers([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load registered sellers')
      setSellers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSellers()
  }, [currentPage, searchQuery])

  const getStatusBadge = (row) => {
    const isSuspended = row.user_status === 'suspended'
    const isActive = row.user_status !== 'inactive' && !isSuspended
    
    return (
      <span className={`badge ${isActive ? 'badge-success' : isSuspended ? 'badge-error' : 'badge-warning'}`}>
        {isActive ? 'Active' : isSuspended ? 'Suspended' : 'Inactive'}
      </span>
    )
  }

  const columns = [
    {
      key: 'name',
      label: 'Seller Name',
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.first_name} {row.last_name || ''}
        </span>
      )
    },
    {
      key: 'user_email',
      label: 'Email',
    },
    {
      key: 'user_phone_no',
      label: 'Mobile No.',
    },
    {
      key: 'shop_name',
      label: 'Shop Name',
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {row.shop_name || 'Not Available'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => navigate(`/sellers/${row._id || row.id}`)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OptimusKart Sellers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review seller registry records, shop verification status, and transaction performance levels.
        </p>
      </div>

      {/* Search Filter */}
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg max-w-md shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search sellers by name or email..."
          className="bg-transparent border-0 focus:outline-none w-full text-sm text-gray-900 dark:text-white"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Sellers List */}
      <Table
        columns={columns}
        data={sellers}
        isLoading={isLoading}
        emptyMessage="No registered sellers found"
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  )
}
