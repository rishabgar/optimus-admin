import { AlertCircle } from 'lucide-react'

export default function EmptyState({ message = 'No data found', icon: Icon = AlertCircle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  )
}
