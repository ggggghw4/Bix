'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/layout/ToastManager';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';
import { 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// تعريف أنواع البيانات
type Message = {
  id: number;
  username: string;
  displayName?: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isOnline?: boolean;
  isVerified?: boolean;
};

type Notification = {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  videoId?: string;
  commentId?: string;
};

// بيانات تجريبية للرسائل
const mockMessages: Message[] = [
  {
    id: 1,
    username: 'sarah_j',
    displayName: 'سارة الجميلة',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    lastMessage: 'أحببت الفيديو الأخير الخاص بك! 🔥',
    timestamp: 'منذ ساعتين',
    unread: true,
    isOnline: true,
    isVerified: true
  },
  {
    id: 2,
    username: 'mike_dancer',
    displayName: 'مايك الراقص',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'هل يمكنك تعليمي تلك الحركة الراقصة؟',
    timestamp: 'منذ يوم',
    unread: false,
    isOnline: false
  },
  {
    id: 3,
    username: 'dance_queen',
    displayName: 'ملكة الرقص',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMessage: 'دعنا نتعاون في فيديو!',
    timestamp: 'منذ 3 أيام',
    unread: false,
    isOnline: true
  },
  {
    id: 4,
    username: 'official_bix',
    displayName: 'بيكس الرسمي',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    lastMessage: 'مرحبًا بك في بيكس! ابدأ في إنشاء المحتوى...',
    timestamp: 'منذ أسبوع',
    unread: false,
    isOnline: true,
    isVerified: true
  },
  {
    id: 5,
    username: 'tech_guru',
    displayName: 'خبير التقنية',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastMessage: 'شكرًا على النصائح التقنية! ساعدتني كثيرًا.',
    timestamp: 'منذ أسبوعين',
    unread: false,
    isOnline: false
  },
  {
    id: 6,
    username: 'travel_addict',
    displayName: 'عاشق السفر',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    lastMessage: 'أين التقطت ذلك الفيديو الرائع؟ المكان جميل جدًا!',
    timestamp: 'منذ شهر',
    unread: false,
    isOnline: false
  },
];

// بيانات تجريبية للإشعارات
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'like',
    username: 'dance_lover',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    content: 'أعجب بفيديو الخاص بك',
    timestamp: 'منذ ساعة',
    read: false,
    videoId: '1'
  },
  {
    id: 2,
    type: 'comment',
    username: 'creative_mind',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    content: 'علق: "حركات رائعة!"',
    timestamp: 'منذ 3 ساعات',
    read: false,
    videoId: '2',
    commentId: '123'
  },
  {
    id: 3,
    type: 'follow',
    username: 'new_follower',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    content: 'بدأ بمتابعتك',
    timestamp: 'منذ يوم',
    read: true
  },
  {
    id: 4,
    type: 'mention',
    username: 'video_creator',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    content: 'ذكرك في تعليق',
    timestamp: 'منذ يومين',
    read: true,
    videoId: '3',
    commentId: '456'
  },
  {
    id: 5,
    type: 'system',
    username: 'Bix',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    content: 'تم تحديث سياسة الخصوصية الخاصة بنا',
    timestamp: 'منذ 3 أيام',
    read: true
  },
  {
    id: 6,
    type: 'like',
    username: 'music_fan',
    avatar: 'https://randomuser.me/api/portraits/women/89.jpg',
    content: 'أعجب بتعليقك',
    timestamp: 'منذ 4 أيام',
    read: true,
    videoId: '4',
    commentId: '789'
  },
  {
    id: 7,
    type: 'follow',
    username: 'travel_addict',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'بدأ بمتابعتك',
    timestamp: 'منذ أسبوع',
    read: true
  },
];

export default function InboxPage() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOptions, setShowOptions] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // تصفية الرسائل بناءً على استعلام البحث
  const filteredMessages = messages.filter(message => 
    message.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (message.displayName && message.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // تصفية الإشعارات بناءً على استعلام البحث
  const filteredNotifications = notifications.filter(notification => 
    notification.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // عدد الإشعارات غير المقروءة
  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;
  
  // عدد الرسائل غير المقروءة
  const unreadMessagesCount = messages.filter(message => message.unread).length;

  // تحديث الإشعارات كمقروءة عند تبديل التبويب
  useEffect(() => {
    if (activeTab === 'notifications') {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
    }
  }, [activeTab]);

  // وظيفة تحديث البيانات
  const refreshData = () => {
    setIsRefreshing(true);
    
    // محاكاة تأخير الشبكة
    setTimeout(() => {
      setIsRefreshing(false);
      
      showToast({
        type: 'success',
        title: 'تم التحديث',
        message: 'تم تحديث البيانات بنجاح',
        duration: 2000
      });
    }, 1500);
  };

  // وظيفة حذف رسالة
  const deleteMessage = (id: number) => {
    setMessages(messages.filter(message => message.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedItemId(null);
    
    showToast({
      type: 'info',
      title: 'تم الحذف',
      message: 'تم حذف المحادثة بنجاح',
      duration: 3000
    });
  };

  // وظيفة حذف إشعار
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedItemId(null);
    
    showToast({
      type: 'info',
      title: 'تم الحذف',
      message: 'تم حذف الإشعار بنجاح',
      duration: 3000
    });
  };

  // وظيفة تحديد عنصر للحذف
  const confirmDelete = (id: number) => {
    setSelectedItemId(id);
    setIsDeleteModalOpen(true);
    setShowOptions(null);
  };

  // وظيفة تحديث حالة القراءة للرسالة
  const markMessageAsRead = (id: number) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, unread: false } : message
    ));
  };

  // وظيفة إنشاء محادثة جديدة
  const createNewMessage = () => {
    if (isGuest) {
      showToast({
        type: 'warning',
        title: 'تسجيل الدخول مطلوب',
        message: 'يجب عليك تسجيل الدخول لإنشاء محادثة جديدة',
        duration: 3000,
        action: {
          text: 'تسجيل الدخول',
          onClick: () => router.push('/auth')
        }
      });
      return;
    }
    
    router.push('/inbox/new');
  };

  return (
    <div className="pb-20 pt-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* شريط التنقل العلوي */}
      <TopNav />
      
      {/* رأس الصفحة */}
      <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {activeTab === 'messages' ? 'الرسائل' : 'الإشعارات'}
          </h1>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {showSearch ? (
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            )}
            
            {activeTab === 'messages' && (
              <button
                onClick={createNewMessage}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={refreshData}
              className={`p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* مربع البحث */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder={activeTab === 'messages' ? 'ابحث في الرسائل...' : 'ابحث في الإشعارات...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pr-10 pl-4 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white transition-colors duration-300"
                />
                <div className="absolute left-3 top-2.5">
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')}>
                      <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                    </button>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* شريط التبويب */}
      <div className="border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors duration-300 ${
              activeTab === 'messages' 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <div className="flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 ml-1 rtl:mr-1 rtl:ml-0" />
              الرسائل
              {unreadMessagesCount > 0 && (
                <span className="mr-1 rtl:ml-1 rtl:mr-0 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors duration-300 ${
              activeTab === 'notifications' 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="flex items-center justify-center">
              <BellIcon className="h-5 w-5 ml-1 rtl:mr-1 rtl:ml-0" />
              الإشعارات
              {unreadNotificationsCount > 0 && (
                <span className="mr-1 rtl:ml-1 rtl:mr-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* عرض الرسائل أو الإشعارات */}
      {activeTab === 'messages' ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-300">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <div key={message.id} className="relative">
                <Link 
                  href={`/inbox/${message.id}`} 
                  className="block"
                  onClick={() => markMessageAsRead(message.id)}
                >
                  <div className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 ${
                    message.unread ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}>
                    <div className="relative h-12 w-12 rounded-full overflow-hidden ml-3 rtl:mr-3 rtl:ml-0">
                      <Image 
                        src={message.avatar} 
                        alt={message.username}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                      {message.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <p className={`font-medium text-gray-900 dark:text-white truncate transition-colors duration-300 ${message.unread ? 'font-bold' : ''}`}>
                            {message.displayName || message.username}
                          </p>
                          {message.isVerified && (
                            <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1 rtl:ml-1 rtl:mr-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{message.timestamp}</p>
                      </div>
                      <p className={`text-sm truncate transition-colors duration-300 ${
                        message.unread 
                          ? 'font-medium text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
                
                <button
                  onClick={() => setShowOptions(showOptions === message.id ? null : message.id)}
                  className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
                
                {showOptions === message.id && (
                  <div className="absolute top-12 left-4 rtl:right-4 rtl:left-auto z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg transition-colors duration-300">
                    <button
                      onClick={() => confirmDelete(message.id)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <TrashIcon className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      حذف المحادثة
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              {searchQuery ? (
                <div>
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">لم يتم العثور على نتائج لـ "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">لا توجد رسائل بعد</p>
                  <button
                    onClick={createNewMessage}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm transition-colors duration-300"
                  >
                    بدء محادثة جديدة
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors duration-300">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="relative">
                <div className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 ${
                  !notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}>
                  <div className="flex">
                    <div className="ml-3 rtl:mr-3 rtl:ml-0">
                      {notification.avatar ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <Image 
                            src={notification.avatar} 
                            alt={notification.username}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <>
                          {notification.type === 'like' && (
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-400 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'comment' && (
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'follow' && (
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 dark:text-green-400 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'mention' && (
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 dark:text-purple-400 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {notification.type === 'system' && (
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        <span className="font-medium">@{notification.username}</span> {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{notification.timestamp}</p>
                      
                      {notification.videoId && (
                        <Link
                          href={`/video/${notification.videoId}${notification.commentId ? `?comment=${notification.commentId}` : ''}`}
                          className="mt-2 inline-block text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300"
                        >
                          عرض {notification.type === 'comment' || notification.type === 'mention' ? 'التعليق' : 'الفيديو'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => confirmDelete(notification.id)}
                  className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              {searchQuery ? (
                <div>
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">لم يتم العثور على نتائج لـ "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <BellIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">لا توجد إشعارات بعد</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* نافذة تأكيد الحذف */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 transition-colors duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              تأكيد الحذف
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
              هل أنت متأكد من رغبتك في حذف {activeTab === 'messages' ? 'هذه المحادثة' : 'هذا الإشعار'}؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedItemId(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (selectedItemId) {
                    if (activeTab === 'messages') {
                      deleteMessage(selectedItemId);
                    } else {
                      deleteNotification(selectedItemId);
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* شريط التنقل السفلي */}
      <BottomNav />
    </div>
  );
}