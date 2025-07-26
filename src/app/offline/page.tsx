'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { WifiIcon } from '@heroicons/react/24/solid';
import BottomNav from '@/components/layout/BottomNav';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // التحقق من حالة الاتصال عند تحميل الصفحة
    setIsOnline(navigator.onLine);

    // إضافة مستمعي الأحداث للتغييرات في حالة الاتصال
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md max-w-md w-full transition-colors duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full transition-colors duration-300">
              <WifiIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            {isOnline ? 'تم استعادة الاتصال!' : 'أنت غير متصل بالإنترنت'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
            {isOnline 
              ? 'تم استعادة الاتصال بالإنترنت. يمكنك الآن العودة إلى التصفح.' 
              : 'لا يمكن الوصول إلى الإنترنت حاليًا. بعض الميزات قد لا تعمل بشكل صحيح.'}
          </p>
          
          <div className="flex flex-col space-y-3">
            {isOnline ? (
              <Link 
                href="/feed" 
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-300"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            ) : (
              <button 
                onClick={handleRefresh}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-md flex items-center justify-center transition-colors duration-300"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                إعادة المحاولة
              </button>
            )}
            
            <Link 
              href="/feed" 
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md transition-colors duration-300"
            >
              تصفح المحتوى المخزن
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
          <p>يمكنك الوصول إلى بعض المحتوى المخزن مسبقًا حتى عندما تكون غير متصل بالإنترنت.</p>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}