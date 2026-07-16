import { useState, useEffect } from 'react'
import { Search, ShieldAlert, Award, Star } from 'lucide-react'
import { customerService } from '../../services'
import Table from '../../components/common/Table'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await customerService.getAll({
        page_no: currentPage,
        search: searchQuery
      })
      
      const payload = response.data.data || []
      
      if (Array.isArray(payload)) {
        setCustomers(payload)
        setTotalPages(1)
      } else if (payload.users) {
        setCustomers(payload.users)
        setTotalPages(payload.totalPages || 1)
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load registered customers')
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [currentPage, searchQuery])

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.first_name} {row.last_name || ''}
        </span>
      )
    },
    {
      key: 'user_email',
      label: 'Email Address',
      render: (row) => row.user_email || 'Not verified'
    },
    {
      key: 'user_phone_no',
      label: 'Mobile No.',
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'
    },
    {
      key: 'reward_tokens',
      label: 'Tokens Balance',
      render: (row) => (
        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-semibold">
          <Award className="w-4 h-4" />
          <span>{row.reward_tokens || 0}</span>
        </div>
      )
    },
    {
      key: 'active_orders',
      label: 'Active Orders',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.active_orders > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.active_orders || 0} Active
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registered Customers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor customer registration data, activity levels, reward token balances, and active delivery orders.
        </p>
      </div>

      {/* Filter Options */}
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg max-w-md shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          className="bg-transparent border-0 focus:outline-none w-full text-sm text-gray-900 dark:text-white"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Customers List */}
      <Table
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage="No registered customers found"
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  )
}
