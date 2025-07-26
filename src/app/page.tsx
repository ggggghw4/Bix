'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to feed - the feed page will handle auth
    router.push('/feed');
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Bix</h1>
      <p className="mb-6">مرحباً بك في تطبيق بيكس</p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
