'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const API_BASE = 'https://api.almostcrackd.ai'

async function getAuthToken() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session.access_token
}

// --- CREATE (Upload) ---

export async function getPresignedUrl(contentType: string) {
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType }),
  })

  if (!response.ok) {
    throw new Error('Failed to get presigned URL')
  }

  return await response.json()
}

export async function registerImage(cdnUrl: string) {
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageUrl: cdnUrl,
      isCommonUse: true // Admins probably uploading common use images?
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to register image')
  }

  revalidatePath('/images')
  return await response.json()
}

// --- UPDATE ---

export async function updateImage(id: string, updates: { is_public?: boolean, is_common_use?: boolean }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('images')
    .update(updates)
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update image: ' + error.message)
  }

  revalidatePath('/images')
}

// --- DELETE ---

export async function deleteImage(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete image: ' + error.message)
  }

  revalidatePath('/images')
}
