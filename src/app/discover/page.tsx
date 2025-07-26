'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, HashtagIcon, FireIcon, MusicalNoteIcon, FaceSmileIcon, GlobeAltIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { mockVideos } from '@/lib/mockData';
import VideoCard from '@/components/video/VideoCard';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// تعريف أنواع البيانات
type Category = {
  id: string;
  name: string;
  arabicName: string;
  icon: React.ElementType;
  videos: typeof mockVideos;
};

type Hashtag = {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
};

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('foryou');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // استرجاع عمليات البحث السابقة من التخزين المحلي
  useEffect(() => {
    const savedSearches = localStorage.getItem('bix-recent-searches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // حفظ عمليات البحث في التخزين المحلي
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    
    try {
      localStorage.setItem('bix-recent-searches', JSON.stringify(updatedSearches));
    } catch (e) {
      console.error('Error saving recent searches:', e);
    }
  };

  // تصفية الفيديوهات بناءً على استعلام البحث
  const filteredVideos = mockVideos.filter(video => 
    video.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // تجميع الفيديوهات حسب الفئات
  const categories: Category[] = [
    { 
      id: 'foryou', 
      name: 'For You', 
      arabicName: 'مخصص لك', 
      icon: GlobeAltIcon, 
      videos: mockVideos.slice(0, 8) 
    },
    { 
      id: 'trending', 
      name: 'Trending', 
      arabicName: 'الرائج', 
      icon: FireIcon, 
      videos: mockVideos.slice(4, 12) 
    },
    { 
      id: 'comedy', 
      name: 'Comedy', 
      arabicName: 'كوميديا', 
      icon: FaceSmileIcon, 
      videos: mockVideos.filter(v => v.tags.includes('comedy') || v.tags.includes('funny')) 
    },
    { 
      id: 'music', 
      name: 'Music', 
      arabicName: 'موسيقى', 
      icon: MusicalNoteIcon, 
      videos: mockVideos.filter(v => v.tags.includes('music') || v.tags.includes('guitar')) 
    },
    { 
      id: 'travel', 
      name: 'Travel', 
      arabicName: 'سفر', 
      icon: GlobeAltIcon, 
      videos: mockVideos.filter(v => v.tags.includes('travel') || v.tags.includes('vacation')) 
    },
    { 
      id: 'food', 
      name: 'Food', 
      arabicName: 'طعام', 
      icon: CameraIcon, 
      videos: mockVideos.filter(v => v.tags.includes('food') || v.tags.includes('cooking')) 
    },
  ];

  // الهاشتاغات الشائعة
  const trendingHashtags: Hashtag[] = [
    { id: '1', name: 'رمضان2025', count: 1245000, trending: true },
    { id: '2', name: 'تحدي_الرقص', count: 987000, trending: true },
    { id: '3', name: 'وصفات_سهلة', count: 756000 },
    { id: '4', name: 'نصائح_جمال', count: 543000 },
    { id: '5', name: 'تحدي_بيكس', count: 432000, trending: true },
    { id: '6', name: 'مقاطع_مضحكة', count: 321000 },
    { id: '7', name: 'رياضة_يومية', count: 234000 },
    { id: '8', name: 'موسيقى_عربية', count: 198000 },
  ];

  // اقتراحات البحث
  const searchSuggestions = [
    'رقص شعبي',
    'أغاني حماسية',
    'وصفات رمضان',
    'مقاطع مضحكة',
    'تحديات 2025',
    'نصائح تقنية',
  ];

  // التعامل مع البحث
  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  // التعامل مع الضغط على Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // الحصول على الفئة النشطة
  const activeCategory = categories.find(cat => cat.id === activeTab) || categories[0];

  return (
    <div className="pb-20 pt-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* شريط التنقل العلوي */}
      <TopNav />
      
      {/* عنوان الصفحة */}
      <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white transition-colors duration-300">استكشاف</h1>
      </div>
      
      {/* مربع البحث */}
      <div className="px-4 my-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن فيديوهات، مستخدمين، أو هاشتاغات..."
            className="w-full py-3 pr-10 pl-4 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white transition-colors duration-300"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyPress={handleKeyPress}
          />
          <div className="absolute left-3 top-3">
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')}>
                <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              </button>
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            )}
          </div>
          
          {/* اقتراحات البحث */}
          {showSuggestions && (
            <div className="absolute z-20 top-12 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto transition-colors duration-300">
              {recentSearches.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1 transition-colors duration-300">عمليات البحث الأخيرة</h3>
                  {recentSearches.map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch();
                      }}
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      {search}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1 transition-colors duration-300">اقتراحات البحث</h3>
                {searchSuggestions
                  .filter(suggestion => suggestion.includes(searchQuery) || searchQuery === '')
                  .map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch();
                      }}
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      {suggestion}
                    </button>
                  ))}
              </div>
              
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1 transition-colors duration-300">هاشتاغات شائعة</h3>
                {trendingHashtags
                  .filter(tag => tag.name.includes(searchQuery) || searchQuery === '')
                  .slice(0, 4)
                  .map((tag) => (
                    <button
                      key={`tag-${tag.id}`}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                      onClick={() => {
                        setSearchQuery(tag.name);
                        handleSearch();
                      }}
                    >
                      <HashtagIcon className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      {tag.name}
                      {tag.trending && (
                        <span className="mr-2 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full transition-colors duration-300">
                          رائج
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* عرض نتائج البحث أو المحتوى المقترح */}
      {searchQuery ? (
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-300">نتائج البحث</h2>
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredVideos.map((video) => (
                <motion.div 
                  key={video.id} 
                  className="aspect-[9/16] rounded-lg overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <VideoCard video={video} isCompact={true} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300" />
              <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">لم يتم العثور على نتائج لـ "{searchQuery}"</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-300">جرب كلمات بحث مختلفة أو تصفح المحتوى المقترح</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* شريط التصنيفات */}
          <div className="sticky top-28 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="overflow-x-auto">
              <div className="flex px-4 py-2 space-x-2 rtl:space-x-reverse">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                      activeTab === category.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab(category.id)}
                  >
                    <category.icon className={`h-4 w-4 ml-1.5 ${
                      activeTab === category.id
                        ? 'text-indigo-500 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    {category.arabicName}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* قسم الهاشتاغات الشائعة */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">الهاشتاغات الرائجة</h2>
              <Link href="/hashtags" className="text-sm text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                عرض الكل
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.slice(0, 6).map((tag) => (
                <button
                  key={tag.id}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                    tag.trending
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  } transition-colors duration-300`}
                  onClick={() => {
                    setSearchQuery(tag.name);
                    handleSearch();
                  }}
                >
                  <HashtagIcon className="h-3.5 w-3.5 ml-1" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* عرض الفيديوهات حسب التصنيف النشط */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{activeCategory.arabicName}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {activeCategory.videos.map((video) => (
                <motion.div 
                  key={video.id} 
                  className="aspect-[9/16] rounded-lg overflow-hidden shadow-md"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <VideoCard video={video} isCompact={true} />
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate transition-colors duration-300">
                      {video.caption.split(' ').slice(0, 5).join(' ')}
                      {video.caption.split(' ').length > 5 ? '...' : ''}
                    </p>
                    <div className="flex items-center mt-1">
                      <Image
                        src={video.userImage}
                        alt={video.username}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 transition-colors duration-300">
                        @{video.username}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* شريط التنقل السفلي */}
      <BottomNav />
    </div>
  );
}