'use client';

import { useEffect, useState } from 'react';
import { WifiIcon } from '@heroicons/react/24/solid';
import { setupOfflineDetection } from '@/app/register-sw';

export default function OfflineAlert() {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // إعداد مراقبة حالة الاتصال
    const cleanup = setupOfflineDetection((isOnline: boolean) => {
      setIsOffline(!isOnline);
      if (!isOnline) {
        setIsVisible(true);
      } else {
        // إخفاء الإشعار بعد فترة عند استعادة الاتصال
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    });

    return cleanup;
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-20 left-0 right-0 mx-auto w-full max-w-sm px-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className={`flex items-center p-3 rounded-lg shadow-lg ${isOffline ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'} transition-colors duration-300`}>
        <div className={`p-2 rounded-full ${isOffline ? 'bg-red-100 dark:bg-red-800' : 'bg-green-100 dark:bg-green-800'}`}>
          <WifiIcon className={`h-5 w-5 ${isOffline ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`} />
        </div>
        <div className="mr-3 flex-1">
          <p className={`text-sm font-medium ${isOffline ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
            {isOffline ? 'أنت غير متصل بالإنترنت' : 'تم استعادة الاتصال'}
          </p>
          <p className={`text-xs ${isOffline ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
            {isOffline ? 'بعض الميزات قد لا تعمل بشكل صحيح' : 'يمكنك الآن استخدام جميع ميزات التطبيق'}
          </p>
        </div>
      </div>
    </div>
  );
}