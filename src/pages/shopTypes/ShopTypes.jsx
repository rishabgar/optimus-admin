import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { shopTypeService } from '../../services'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ImageUpload from '../../components/common/ImageUpload'
import toast from 'react-hot-toast'

export default function ShopTypes() {
  const [shopTypes, setShopTypes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      shop_type_name: '',
      shop_type_image: '',
    },
  })

  const loadShopTypes = async () => {
    setIsLoading(true)
    try {
      const response = await shopTypeService.getAll({
        page_no: currentPage,
        search: searchQuery,
      })
      
      const payload = response.data.data || []
      // The backend returns an array directly, or a paginated object
      if (Array.isArray(payload)) {
        setShopTypes(payload)
        setTotalPages(1)
      } else if (payload.shopTypes) {
        setShopTypes(payload.shopTypes)
        setTotalPages(payload.totalPages || 1)
      } else {
        setShopTypes([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load shop types')
      setShopTypes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShopTypes()
  }, [currentPage, searchQuery])

  const handleOpenCreate = () => {
    setEditingType(null)
    reset({
      shop_type_name: '',
      shop_type_image: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (type) => {
    setEditingType(type)
    reset({
      shop_type_name: type.shop_type_name,
      shop_type_image: type.shop_type_image || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shop type? All categories under it may be affected.')) return
    try {
      await shopTypeService.delete(id)
      toast.success('Shop type deleted successfully')
      loadShopTypes()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to delete shop type')
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingType) {
        await shopTypeService.update(editingType.shop_type_id, data)
        toast.success('Shop type updated successfully')
      } else {
        await shopTypeService.create(data)
        toast.success('Shop type created successfully')
      }
      setIsModalOpen(false)
      loadShopTypes()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save shop type')
    }
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => {
        const imgUrl = row.shop_type_image
          ? (row.shop_type_image.startsWith('http') ? row.shop_type_image : `https://image.optimuskart.com/${row.shop_type_image}`)
          : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'
        return (
          <img
            src={imgUrl}
            alt={row.shop_type_name}
            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50"
          />
        )
      },
    },
    {
      key: 'shop_type_name',
      label: 'Shop Type Name',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.shop_type_id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Types</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage top-level vendor directories and categories (e.g. Grocery, Restaurant, Electronics).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shop Type</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg max-w-md shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search shop types..."
          className="bg-transparent border-0 focus:outline-none w-full text-sm text-gray-900 dark:text-white"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Table List */}
      <Table
        columns={columns}
        data={shopTypes}
        isLoading={isLoading}
        emptyMessage="No shop types found"
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? 'Edit Shop Type' : 'Create Shop Type'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Shop Type Name
              </label>
              <input
                type="text"
                className={`input-field dark:input-field ${errors.shop_type_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. Pharmacy, Restaurant"
                {...register('shop_type_name', { required: 'Name is required' })}
              />
              {errors.shop_type_name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.shop_type_name.message}</p>
              )}
            </div>

            <div>
              <Controller
                name="shop_type_image"
                control={control}
                rules={{ required: 'Image is required' }}
                render={({ field }) => (
                  <ImageUpload
                    label="Shop Type Banner/Image"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.shop_type_image && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.shop_type_image.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary shadow-md shadow-blue-500/10">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
