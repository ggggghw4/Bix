'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import VideoCard from '@/components/video/VideoCard';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  StarIcon,
  TrophyIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // بيانات وهمية للفيديوهات المفضلة
  const mockFavorites = [
    {
      id: '1',
      username: 'dance_star',
      userImage: '/api/placeholder/40/40',
      caption: 'Check out this new dance routine! #dance #trending',
      videoUrl: '/api/placeholder/400/600',
      audioTitle: 'Original Sound - dance_star',
      likes: 1245,
      comments: 89,
      shares: 45,
      tags: ['dance', 'trending'],
      isFollowing: false
    },
    {
      id: '2',
      username: 'cooking_master',
      userImage: '/api/placeholder/40/40',
      caption: 'وصفة سهلة وسريعة للمعكرونة 🍝 #طبخ #وصفات',
      videoUrl: '/api/placeholder/400/600',
      audioTitle: 'Cooking Music',
      likes: 892,
      comments: 156,
      shares: 78,
      tags: ['طبخ', 'وصفات'],
      isFollowing: true
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setFavorites(mockFavorites);
      setLoading(false);
    }, 1000);

    // تحميل النقاط من localStorage
    const savedPoints = localStorage.getItem('bix-user-points');
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }

    // إضافة نقاط لزيارة صفحة المفضلة
    const newPoints = points + 10;
    setPoints(newPoints);
    localStorage.setItem('bix-user-points', newPoints.toString());
    
    // إرسال حدث تحديث النقاط
    window.dispatchEvent(new CustomEvent('pointsUpdated', { 
      detail: { points: newPoints } 
    }));
  }, []);

  const achievements = [
    { id: 1, title: 'محب الفيديوهات', description: 'شاهد 10 فيديوهات', points: 50, unlocked: points >= 50 },
    { id: 2, title: 'مستكشف', description: 'زر صفحة المفضلة', points: 25, unlocked: true },
    { id: 3, title: 'نجم صاعد', description: 'احصل على 100 نقطة', points: 100, unlocked: points >= 100 },
    { id: 4, title: 'خبير التطبيق', description: 'احصل على 500 نقطة', points: 500, unlocked: points >= 500 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">
        <TopNav />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20 transition-colors duration-300">
      <TopNav />
      
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center">
                <HeartIconSolid className="h-8 w-8 mr-3" />
                المفضلة
              </h1>
              <p className="text-pink-100">
                الفيديوهات التي أعجبتك • {favorites.length} فيديو
              </p>
            </div>
            
            {/* عرض النقاط */}
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <StarIcon className="h-5 w-5 mr-2" />
              <span className="font-bold">{points} نقطة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* قسم الإنجازات */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            إنجازاتك
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {achievement.unlocked ? (
                      <TrophyIcon className="h-8 w-8 text-yellow-500 mr-3" />
                    ) : (
                      <GiftIcon className="h-8 w-8 text-gray-400 mr-3" />
                    )}
                    <div>
                      <h3 className={`font-bold ${
                        achievement.unlocked 
                          ? 'text-yellow-700 dark:text-yellow-300' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    achievement.unlocked
                      ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {achievement.points} نقطة
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* الفيديوهات المفضلة */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            فيديوهاتك المفضلة
          </h2>
          
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
                >
                  <VideoCard 
                    video={video} 
                    isCompact={true}
                    autoPlay={false}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد فيديوهات مفضلة بعد
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                ابدأ بإضافة فيديوهات إلى مفضلتك لتظهر هنا
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}