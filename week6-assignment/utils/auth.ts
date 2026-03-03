import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Check if user is superadmin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.is_superadmin) {
    // Redirect to unauthorized page or show error
    redirect('/unauthorized');
  }

  return user;
}
