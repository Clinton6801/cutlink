'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  currentImages?: string[]
  maxImages?: number
}

export default function ImageUpload({ 
  onUploadComplete, 
  currentImages = [], 
  maxImages = 6 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError('')

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('stylist-portfolios')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('stylist-portfolios')
        .getPublicUrl(filePath)

      onUploadComplete(data.publicUrl)
      
      // Reset input
      event.target.value = ''
    } catch (error: any) {
      setError(error.message)
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const canUploadMore = currentImages.length < maxImages

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {canUploadMore ? (
        <div>
          <label
            htmlFor="image-upload"
            className={`
              flex flex-col items-center justify-center w-full h-32 
              border-2 border-dashed rounded-lg cursor-pointer
              transition
              ${uploading 
                ? 'border-gray-600 bg-gray-800 cursor-not-allowed' 
                : 'border-gray-700 bg-black hover:border-yellow-500 hover:bg-gray-900'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <div className="animate-spin text-4xl mb-2">⏳</div>
                  <p className="text-sm text-gray-400">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-yellow-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                </>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {currentImages.length} / {maxImages} images uploaded
          </p>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-yellow-500 text-sm">
            Maximum of {maxImages} images reached. Delete an image to upload more.
          </p>
        </div>
      )}
    </div>
  )
}