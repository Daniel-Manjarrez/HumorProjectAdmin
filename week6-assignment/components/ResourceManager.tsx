'use client'

import { useState } from 'react'
import { createResource, updateResource, deleteResource } from '@/app/resources/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdvancedFilter from '@/components/AdvancedFilter'
import Pagination from '@/components/Pagination'

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
  basePath?: string
  // Pagination Props
  page: number
  totalPages: number
  hasNextPage: boolean
}

export default function ResourceManager({
  tableName,
  title,
  columns,
  initialData,
  basePath,
  page,
  totalPages,
  hasNextPage
}: Props) {
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
      const payload: any = {}
      columns.forEach(col => {
        if (col.editable !== false && formData[col.key] !== undefined) {
          payload[col.key] = formData[col.key]
        }
      })

      columns.forEach(col => {
        if (col.type === 'number' && payload[col.key]) {
          payload[col.key] = Number(payload[col.key])
        }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          Add New
        </button>
      </div>

      <AdvancedFilter columns={columns.map(c => ({
        key: c.key,
        label: c.label,
        type: c.type === 'datetime' ? 'date' : c.type === 'textarea' ? 'text' : c.type
      }))} />

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 transition-colors">
            {initialData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {basePath && col.key === columns[0].key ? (
                      <Link href={`${basePath}/${item.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline">
                        {String(item[col.key] ?? '-')}
                      </Link>
                    ) : col.type === 'boolean' ? (
                      (item[col.key] ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">No</span>
                      ))
                    ) : col.type === 'datetime' ? (
                      new Date(item[col.key]).toLocaleDateString()
                    ) : (
                      // Truncate long text
                      String(item[col.key] ?? '-').length > 50
                        ? String(item[col.key]).substring(0, 50) + '...'
                        : String(item[col.key] ?? '-')
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {basePath && (
                    <Link
                      href={`${basePath}/${item.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initialData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} hasNextPage={hasNextPage} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Create New Item'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {columns.filter(col => col.editable !== false).map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </label>

                  {col.type === 'textarea' ? (
                    <textarea
                      required={col.required}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm bg-white dark:bg-gray-900"
                      rows={4}
                      value={formData[col.key] || ''}
                      onChange={e => handleInputChange(col.key, e.target.value)}
                    />
                  ) : col.type === 'boolean' ? (
                    <select
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm bg-white dark:bg-gray-900 cursor-pointer"
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
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm bg-white dark:bg-gray-900"
                      value={formData[col.key] || ''}
                      onChange={e => handleInputChange(col.key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-colors"
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
