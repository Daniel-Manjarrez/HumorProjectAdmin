'use server'

import { createClient } from '@/utils/supabase/server'

export async function getStats() {
  const supabase = await createClient()

  // 1. Basic Counts
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

  // 2. Most Liked Caption
  // We can query captions ordered by like_count
  const { data: topCaption } = await supabase
    .from('captions')
    .select('content, like_count')
    .order('like_count', { ascending: false })
    .limit(1)
    .single()

  // 3. Caption with Most Votes (Highest Engagement)
  // We can group by caption_id in caption_votes if there was a view,
  // but since we only have the raw table, we can just show the highest rated
  // caption as our proxy for "Best Caption"

  // 4. Most Active Voter
  // We need to count votes per user. Supabase JS doesn't support GROUP BY directly
  // via the standard query builder without an RPC.
  // Instead of a complex manual group-by for all votes (which could be huge),
  // we will add a simpler stat: Total Approved Captions (votes > 0)

  const { count: totalPositiveVotes } = await supabase
    .from('caption_votes')
    .select('*', { count: 'exact', head: true })
    .gt('vote_value', 0)

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
    {
      title: 'Positive Votes',
      value: totalPositiveVotes ?? 0,
      description: 'Total number of "Love It" (positive) votes cast.',
      color: 'pink',
    },
    {
      title: 'Top Rated Caption',
      value: topCaption?.like_count ? `${topCaption.like_count} Likes` : 'None',
      description: topCaption?.content ? `"${topCaption.content.substring(0, 60)}..."` : 'No captions rated yet.',
      color: 'yellow',
    },
  ]
}
