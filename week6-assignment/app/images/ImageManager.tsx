'use client'

import { useState } from 'react'
import { getPresignedUrl, registerImage, updateImage, deleteImage } from './actions'

type Image = {
  id: string
  url: string | null
  created_datetime_utc: string
  is_public: boolean
  is_common_use: boolean
}

export default function ImageManager({ initialImages }: { initialImages: Image[] }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Get URL
      let contentType = file.type
      if (!contentType) {
         if (file.name.toLowerCase().endsWith('.heic')) contentType = 'image/heic'
      }
      if (!contentType) throw new Error('Unknown file type')

      const { presignedUrl, cdnUrl } = await getPresignedUrl(contentType)

      // 2. Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file
      })

      // 3. Register
      await registerImage(cdnUrl)

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      await deleteImage(id)
    } catch (error) {
      alert('Delete failed')
    }
  }

  const handleToggle = async (id: string, field: 'is_public' | 'is_common_use', currentValue: boolean) => {
    try {
      await updateImage(id, { [field]: !currentValue })
    } catch (error) {
      alert('Update failed')
    }
  }

  return (
    <div>
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Image</h2>
        <div className="flex items-center gap-4">
          <label className={`
            flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {uploading ? 'Uploading...' : 'Select Image'}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              accept="image/*"
            />
          </label>
          <span className="text-sm text-gray-500">
            Supported: JPG, PNG, WEBP, GIF
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {initialImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
              {image.url ? (
                <img src={image.url} alt="Uploaded" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">No URL</span>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-500 truncate mb-2 font-mono">ID: {image.id}</p>
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(image.created_datetime_utc).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Public</span>
                  <button
                    onClick={() => handleToggle(image.id, 'is_public', image.is_public)}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                      ${image.is_public ? 'bg-green-600' : 'bg-gray-200'}
                    `}
                  >
                    <span className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${image.is_public ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Common Use</span>
                  <button
                    onClick={() => handleToggle(image.id, 'is_common_use', image.is_common_use)}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                      ${image.is_common_use ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  >
                    <span className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${image.is_common_use ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
