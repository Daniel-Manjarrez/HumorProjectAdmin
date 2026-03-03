'use server'

import { createClient } from '@/utils/supabase/server'

export async function getStats() {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalCaptions } = await supabase
    .from('captions')
    .select('*', { count: 'exact', head: true })

  const { count: totalVotes } = await supabase
    .from('caption_votes')
    .select('*', { count: 'exact', head: true })

  const { count: totalImages } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })

  return [
    {
      title: 'Total Users',
      value: totalUsers ?? 0,
      description: 'The total number of users in the profiles table.',
      color: 'blue',
    },
    {
      title: 'Total Captions',
      value: totalCaptions ?? 0,
      description: 'The total number of captions generated.',
      color: 'green',
    },
    {
      title: 'Total Votes',
      value: totalVotes ?? 0,
      description: 'The total number of votes cast on captions.',
      color: 'purple',
    },
    {
      title: 'Total Images',
      value: totalImages ?? 0,
      description: 'The total number of images uploaded.',
      color: 'red',
    },
  ]
}
