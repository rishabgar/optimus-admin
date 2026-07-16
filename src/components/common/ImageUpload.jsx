import { useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import { uploadService } from '../../services'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ImageUpload({ value, onChange, label = 'Upload Image' }) {
  const { admin } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value ? (value.startsWith('http') ? value : `https://image.optimuskart.com/${value}`) : '')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show client side preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const userId = admin?.user__id || admin?.id || 'admin'
      
      // Get signed upload URL from backend
      const response = await uploadService.getSignedUrl(userId, file.type)
      const { path, presignedUrl } = response.data.data

      // Upload file directly to S3/R2
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      })

      // Send relative key path to parent
      onChange(path)
      setPreviewUrl(`https://image.optimuskart.com/${path}`)
      toast.success('Image uploaded successfully')
    } catch (err) {
      console.error('Image upload failed:', err)
      toast.error('Failed to upload image')
      setPreviewUrl(value ? (value.startsWith('http') ? value : `https://image.optimuskart.com/${value}`) : '')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = (e) => {
    e.preventDefault()
    setPreviewUrl('')
    onChange('')
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="flex items-center space-x-4">
        {previewUrl ? (
          <div className="relative w-24 h-24 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-accent dark:hover:border-accent rounded-lg cursor-pointer bg-white dark:bg-gray-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Browse</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>PNG, JPG, WEBP, or GIF up to 5MB.</p>
          <p>Image will be processed and saved securely.</p>
        </div>
      </div>
    </div>
  )
}
