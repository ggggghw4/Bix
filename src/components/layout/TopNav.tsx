'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import WalletIcon from '@/components/icons/WalletIcon';

export default function TopNav() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [favorites, setFavorites] = useState(0);

  // تحديث النقاط عند المشاهدة
  useEffect(() => {
    const savedPoints = localStorage.getItem('bix-user-points');
    const savedFavorites = localStorage.getItem('bix-user-favorites');
    
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }
    if (savedFavorites) {
      setFavorites(parseInt(savedFavorites));
    }

    // استمع لتحديثات النقاط
    const handlePointsUpdate = (event: CustomEvent) => {
      const newPoints = event.detail.points;
      setPoints(newPoints);
      localStorage.setItem('bix-user-points', newPoints.toString());
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate as EventListener);
    };
  }, []);

  const handleFavoritesClick = () => {
    // إضافة نقاط عند زيارة المفضلة
    const newPoints = points + 5;
    setPoints(newPoints);
    localStorage.setItem('bix-user-points', newPoints.toString());
    
    // إرسال حدث تحديث النقاط
    window.dispatchEvent(new CustomEvent('pointsUpdated', { 
      detail: { points: newPoints } 
    }));
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-40 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3">
        {/* الشعار */}
        <Link href="/feed" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Bix
          </span>
        </Link>

        {/* شريط البحث - مخفي على الشاشات الصغيرة */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50/80 dark:bg-gray-800/80 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:text-white transition-all duration-300"
              placeholder="ابحث عن فيديوهات، مستخدمين، أو هاشتاغات..."
            />
          </div>
        </div>

        {/* أزرار التنقل */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* زر البحث للشاشات الصغيرة */}
          <Link 
            href="/discover" 
            className="md:hidden p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </Link>

          {/* زر المفضلة مع النقاط */}
          <Link 
            href="/favorites"
            onClick={handleFavoritesClick}
            className="relative p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group"
          >
            <HeartIcon className="h-6 w-6 group-hover:text-red-500 transition-colors duration-300" />
            {favorites > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {favorites > 99 ? '99+' : favorites}
              </span>
            )}
          </Link>

          {/* عرض النقاط */}
          <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            <StarIcon className="h-4 w-4 mr-1" />
            <span>{points > 9999 ? '9999+' : points}</span>
          </div>
          
          {/* زر الوضع المظلم */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}