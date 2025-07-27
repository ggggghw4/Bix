'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';

// نوع البيانات للإشعار
type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
  videoId?: string;
  commentId?: string;
};

// بيانات تجريبية للإشعارات
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    message: 'أعجب بفيديو الخاص بك',
    timestamp: 'منذ 5 دقائق',
    read: false,
    user: {
      id: '101',
      username: 'ahmed_123',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    videoId: '1',
  },
  {
    id: '2',
    type: 'comment',
    message: 'علق على الفيديو الخاص بك: "رائع جداً! 👏"',
    timestamp: 'منذ 15 دقيقة',
    read: false,
    user: {
      id: '102',
      username: 'sara_90',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    videoId: '2',
    commentId: '123',
  },
  {
    id: '3',
    type: 'follow',
    message: 'بدأ بمتابعتك',
    timestamp: 'منذ 2 ساعة',
    read: true,
    user: {
      id: '103',
      username: 'mohamed_travel',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
  },
  {
    id: '4',
    type: 'mention',
    message: 'ذكرك في تعليق: "شاهد هذا @user 🔥"',
    timestamp: 'منذ 1 يوم',
    read: true,
    user: {
      id: '104',
      username: 'layla_art',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
    videoId: '3',
    commentId: '456',
  },
  {
    id: '5',
    type: 'system',
    message: 'تم تحديث سياسة الخصوصية الخاصة بنا. يرجى مراجعتها.',
    timestamp: 'منذ 3 أيام',
    read: true,
  },
];

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  // حساب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // تحديث حالة الإشعار كمقروء
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // تحديث جميع الإشعارات كمقروءة
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // حذف إشعار
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // الحصول على أيقونة الإشعار حسب النوع
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <>
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-300"
        aria-label="الإشعارات"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* لوحة الإشعارات */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 overflow-hidden"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-25" />
            
            <div className="fixed inset-y-0 right-0 max-w-full flex" onClick={e => e.stopPropagation()}>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-screen max-w-md"
              >
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl transition-colors duration-300">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">الإشعارات</h2>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-300"
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <BellIcon className="h-12 w-12 mb-4" />
                        <p>ليس لديك إشعارات حالياً</p>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {notifications.map(notification => (
                          <li
                            key={notification.id}
                            className={`flex p-3 rounded-lg ${
                              !notification.read 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                                : 'bg-white dark:bg-gray-800'
                            } transition-colors duration-300`}
                          >
                            {notification.user ? (
                              <div className="flex-shrink-0 mr-3 rtl:ml-3 rtl:mr-0">
                                <Link href={`/profile/${notification.user.username}`}>
                                  <div className="relative w-10 h-10">
                                    <Image
                                      src={notification.user.avatar}
                                      alt={notification.user.username}
                                      width={40}
                                      height={40}
                                      className="rounded-full object-cover"
                                      onError={(e) => {
                                        // في حالة فشل تحميل الصورة، استخدم صورة افتراضية
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null; // منع التكرار اللانهائي
                                        target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                                      }}
                                    />
                                  </div>
                                </Link>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 mr-3 rtl:ml-3 rtl:mr-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                                {notification.user && (
                                  <Link href={`/profile/${notification.user.username}`} className="font-bold hover:underline">
                                    {notification.user.username}
                                  </Link>
                                )}{' '}
                                {notification.message}
                              </div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {notification.timestamp}
                              </div>
                              
                              {notification.videoId && (
                                <Link
                                  href={`/video/${notification.videoId}${notification.commentId ? `?comment=${notification.commentId}` : ''}`}
                                  className="mt-2 inline-block text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-300"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  عرض {notification.type === 'comment' || notification.type === 'mention' ? 'التعليق' : 'الفيديو'}
                                </Link>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 self-start ml-2 rtl:mr-2 rtl:ml-0">
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}