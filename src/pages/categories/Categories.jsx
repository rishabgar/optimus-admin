import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { categoryService, shopTypeService } from '../../services'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ImageUpload from '../../components/common/ImageUpload'
import toast from 'react-hot-toast'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [shopTypes, setShopTypes] = useState([])
  const [selectedShopTypeId, setSelectedShopTypeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      product_category_name: '',
      product_category_image: '',
      shop_type_id: '',
    },
  })

  // Load Shop Types for Dropdowns
  const loadShopTypes = async () => {
    try {
      const response = await shopTypeService.getAll()
      const payload = response.data.data || []
      if (Array.isArray(payload)) {
        setShopTypes(payload)
      } else if (payload.shopTypes) {
        setShopTypes(payload.shopTypes)
      }
    } catch (err) {
      console.error('Failed to load shop types', err)
    }
  }

  // Load Categories list
  const loadCategories = async () => {
    setIsLoading(true)
    try {
      let response
      if (selectedShopTypeId) {
        // If filter is active, fetch category by shop type
        response = await categoryService.getByShopType(selectedShopTypeId)
        const payload = response.data.data || []
        // For shop type specific categories, filter with query client-side
        const list = Array.isArray(payload) ? payload : (payload.categories || [])
        const filtered = list.filter(cat => 
          cat.product_category_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setCategories(filtered)
        setTotalPages(1)
      } else {
        // Otherwise load common categories paginated
        response = await categoryService.getCommon({
          page_no: currentPage,
        })
        const payload = response.data.data || []
        if (Array.isArray(payload)) {
          // If search is active, filter client-side since API doesn't support query parameters directly
          const filtered = payload.filter(cat => 
            cat.product_category_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setCategories(filtered)
          setTotalPages(1)
        } else if (payload.categories) {
          setCategories(payload.categories)
          setTotalPages(payload.totalPages || 1)
        } else {
          setCategories([])
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load product categories')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShopTypes()
  }, [])

  useEffect(() => {
    loadCategories()
  }, [currentPage, selectedShopTypeId, searchQuery])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    reset({
      product_category_name: '',
      product_category_image: '',
      shop_type_id: shopTypes[0]?.shop_type_id || '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category) => {
    setEditingCategory(category)
    reset({
      product_category_name: category.product_category_name,
      product_category_image: category.product_category_image || '',
      shop_type_id: category.shop_type_id || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All products mapped under it will lose category association.')) return
    try {
      await categoryService.delete(id)
      toast.success('Category deleted successfully')
      loadCategories()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.product_category_id || editingCategory._id, {
          product_category_name: data.product_category_name,
          product_category_image: data.product_category_image,
        })
        toast.success('Category updated successfully')
      } else {
        await categoryService.create(data)
        toast.success('Category created successfully')
      }
      setIsModalOpen(false)
      loadCategories()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save category')
    }
  }

  const getShopTypeName = (id) => {
    const type = shopTypes.find(t => t.shop_type_id === id)
    return type ? type.shop_type_name : 'Common'
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => {
        const imgUrl = row.product_category_image
          ? (row.product_category_image.startsWith('http') ? row.product_category_image : `https://image.optimuskart.com/${row.product_category_image}`)
          : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'
        return (
          <img
            src={imgUrl}
            alt={row.product_category_name}
            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50"
          />
        )
      },
    },
    {
      key: 'product_category_name',
      label: 'Category Name',
    },
    {
      key: 'shop_type_id',
      label: 'Shop Type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-semibold uppercase">
          {getShopTypeName(row.shop_type_id)}
        </span>
      ),
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
            onClick={() => handleDelete(row.product_category_id || row._id)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage product categories and group them under respective shop types.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg shadow-sm">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search categories..."
            className="bg-transparent border-0 focus:outline-none w-full text-sm text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        {/* Dropdown Shop Type Filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg shadow-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="bg-transparent border-0 focus:outline-none text-sm text-gray-900 dark:text-white"
            value={selectedShopTypeId}
            onChange={(e) => {
              setSelectedShopTypeId(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Shop Types</option>
            {shopTypes.map((type) => (
              <option key={type.shop_type_id} value={type.shop_type_id}>
                {type.shop_type_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <Table
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No product categories found"
        pagination={selectedShopTypeId ? null : {
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                className={`input-field dark:input-field ${errors.product_category_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. Fruits, Laptops, Dairy"
                {...register('product_category_name', { required: 'Name is required' })}
              />
              {errors.product_category_name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.product_category_name.message}</p>
              )}
            </div>

            {!editingCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Shop Type
                </label>
                <select
                  className={`input-field dark:input-field ${errors.shop_type_id ? 'border-red-500 focus:ring-red-500' : ''}`}
                  {...register('shop_type_id', { required: 'Shop type is required' })}
                >
                  <option value="">Choose Shop Type</option>
                  {shopTypes.map((type) => (
                    <option key={type.shop_type_id} value={type.shop_type_id}>
                      {type.shop_type_name}
                    </option>
                  ))}
                </select>
                {errors.shop_type_id && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.shop_type_id.message}</p>
                )}
              </div>
            )}

            <div>
              <Controller
                name="product_category_image"
                control={control}
                rules={{ required: 'Image is required' }}
                render={({ field }) => (
                  <ImageUpload
                    label="Category Icon/Image"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.product_category_image && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.product_category_image.message}</p>
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
