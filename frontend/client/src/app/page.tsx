'use client';

import { useState } from 'react';
import WelcomeScreen from '@/components/RoomTalk/WelcomeScreen';
import Dashboard from '@/components/RoomTalk/Dashboard';

export default function Home() {
  const [username, setUsername] = useState('');

  if (username) {
    return <Dashboard username={username} />;
  }

  return <WelcomeScreen onEnter={setUsername} />;
}
