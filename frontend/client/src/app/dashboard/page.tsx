'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import Dashboard from '@/components/RoomTalk/Dashboard';

export default function DashboardPage() {
  const username = useUserStore((s) => s.username);
  const router = useRouter();

  useEffect(() => {
    if (!username) router.replace('/');
  }, [username, router]);

  if (!username) return null;

  return <Dashboard username={username} />;
}
