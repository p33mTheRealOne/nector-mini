import { supabaseServer } from '@/lib/supabase/server';
import LandingPage from '@/components/Landing';
import AppHome from './Chat/AppHome';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const displayName = (user.user_metadata as any)?.display_name;
  if (!displayName || !String(displayName).trim()) {
    redirect('/onboarding/username');
  }

  return <AppHome/>;
}
