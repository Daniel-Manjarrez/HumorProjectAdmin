'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) throw new Error('Unauthorized')
  return supabase
}

export async function createResource(table: string, data: any) {
  const supabase = await checkAdmin()

  // Remove id if present (let DB handle identity)
  const { id, ...payload } = data

  const { error } = await supabase
    .from(table)
    .insert(payload)

  if (error) throw new Error(error.message)
  revalidatePath(`/${table}`)
}

export async function updateResource(table: string, id: any, data: any) {
  const supabase = await checkAdmin()

  const { error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/${table}`)
}

export async function deleteResource(table: string, id: any) {
  const supabase = await checkAdmin()

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/${table}`)
}
