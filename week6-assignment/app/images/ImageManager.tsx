'use client'

import { useState } from 'react'
import { getPresignedUrl, registerImage, deleteImage, updateImage } from './actions'
import Link from 'next/link'

type Image = {
  id: string
  url: string
  profile_id: string
  is_public: boolean
  is_common_use: boolean
  created_datetime_utc: string
}

export default function ImageManager({ initialImages }: { initialImages: Image[] }) {
  const [images, setImages] = useState<Image[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      let contentType = file.type
      if (!contentType) {
        const name = file.name.toLowerCase()
        if (name.endsWith('.heic')) contentType = 'image/heic'
        else if (name.endsWith('.heif')) contentType = 'image/heif'
        else contentType = 'application/octet-stream'
      }

      // 1. Get presigned URL
      const { presignedUrl, cdnUrl } = await getPresignedUrl(contentType)

      // 2. Upload to S3 directly
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload to storage')

      // 3. Register in DB
      await registerImage(cdnUrl)

      // We don't manually append to the array because we want the DB to be the source of truth,
      // and we expect the parent server component to refresh. But since we are client side,
      // we can do a hard refresh or wait for Next.js to revalidatePath.
      window.location.reload()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      await deleteImage(id)
      setImages(images.filter(img => img.id !== id))
    } catch (err: any) {
      alert('Error deleting: ' + err.message)
    }
  }

  const handleToggle = async (id: string, field: 'is_public' | 'is_common_use', currentValue: boolean) => {
    try {
      // Optimistic update
      setImages(images.map(img => img.id === id ? { ...img, [field]: !currentValue } : img))
      await updateImage(id, { [field]: !currentValue })
    } catch (err: any) {
      alert('Error updating: ' + err.message)
      // Revert on failure (simplified)
      window.location.reload()
    }
  }

  return (
    <div>
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload New Image</label>
        <div className="flex items-center">
          <label className={`
            flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {uploading ? 'Uploading...' : 'Choose File'}
            <input
              type="file"
              className="hidden"
              accept="image/*,.heic,.heif"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map(image => (
          <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
            <div className="h-48 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative group">
              {image.url ? (
                <img src={image.url} alt={image.id} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 dark:text-gray-500">No Image</span>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="p-4 flex-grow flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate" title={image.id}>
                  ID: {image.id.substring(0, 13)}...
                </p>
                <Link href={`/images/${image.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View Details →
                </Link>
              </div>

              <div className="space-y-2 mt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer opacity-0 z-10"
                      checked={image.is_public}
                      onChange={() => handleToggle(image.id, 'is_public', image.is_public)}
                    />
                    <div className={`
                      block w-10 h-6 rounded-full transition-colors
                      ${image.is_public ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `}></div>
                    <div className={`
                      absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform
                      ${image.is_public ? 'transform translate-x-4' : ''}
                    `}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Common Use</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer opacity-0 z-10"
                      checked={image.is_common_use}
                      onChange={() => handleToggle(image.id, 'is_common_use', image.is_common_use)}
                    />
                    <div className={`
                      block w-10 h-6 rounded-full transition-colors
                      ${image.is_common_use ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `}></div>
                    <div className={`
                      absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform
                      ${image.is_common_use ? 'transform translate-x-4' : ''}
                    `}></div>
                  </div>
                </label>
              </div>

            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No images found.
        </div>
      )}
    </div>
  )
}
