'use client'

import { useState } from 'react'
import { createResource, updateResource, deleteResource } from '@/app/resources/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type ColumnDef = {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'datetime' | 'textarea'
  editable?: boolean // default true
  required?: boolean
}

type Props = {
  tableName: string
  title: string
  columns: ColumnDef[]
  initialData: any[]
  basePath?: string // Optional base path for detail view (e.g., "/humor-flavors")
}

export default function ResourceManager({ tableName, title, columns, initialData, basePath }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({})
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await deleteResource(tableName, id)
      router.refresh()
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter out non-editable columns for create/update payload
      const payload: any = {}
      columns.forEach(col => {
        if (col.editable !== false && formData[col.key] !== undefined) {
          payload[col.key] = formData[col.key]
        }
      })

      // Convert types if needed (e.g. number strings to numbers)
      columns.forEach(col => {
        if (col.type === 'number' && payload[col.key]) {
          payload[col.key] = Number(payload[col.key])
        }
        // Handle boolean selects
        if (col.type === 'boolean' && typeof payload[col.key] === 'string') {
           payload[col.key] = payload[col.key] === 'true'
        }
      })

      if (editingItem) {
        await updateResource(tableName, editingItem.id, payload)
      } else {
        await createResource(tableName, payload)
      }

      setIsModalOpen(false)
      router.refresh()
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {basePath && col.key === columns[0].key ? (
                      <Link href={`${basePath}/${item.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                        {String(item[col.key] ?? '-')}
                      </Link>
                    ) : col.type === 'boolean' ? (
                      (item[col.key] ? 'Yes' : 'No')
                    ) : col.type === 'datetime' ? (
                      new Date(item[col.key]).toLocaleDateString()
                    ) : (
                      String(item[col.key] ?? '-')
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {basePath && (
                    <Link
                      href={`${basePath}/${item.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initialData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Edit Item' : 'Create New Item'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {columns.filter(col => col.editable !== false).map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </label>

                  {col.type === 'textarea' ? (
                    <textarea
                      required={col.required}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      value={formData[col.key] || ''}
                      onChange={e => handleInputChange(col.key, e.target.value)}
                    />
                  ) : col.type === 'boolean' ? (
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData[col.key] === undefined ? '' : String(formData[col.key])}
                      onChange={e => handleInputChange(col.key, e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={col.type === 'number' ? 'number' : 'text'}
                      required={col.required}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData[col.key] || ''}
                      onChange={e => handleInputChange(col.key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
