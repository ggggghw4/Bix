'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/layout/ToastManager';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  CameraIcon,
  PencilIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  WifiIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { Fragment } from 'react';

export default function SettingsPage() {
  const { user, isGuest, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataUsage, setDataUsage] = useState('wifi');
  const [language, setLanguage] = useState('ar');
  const [videoQuality, setVideoQuality] = useState('auto');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    website: '',
    email: '',
    phone: ''
  });

  // تحميل الإعدادات من التخزين المحلي
  useEffect(() => {
    const savedSettings = localStorage.getItem('bix-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode || false);
        setNotifications(settings.notifications !== false);
        setPrivateAccount(settings.privateAccount || false);
        setAutoPlay(settings.autoPlay !== false);
        setDataUsage(settings.dataUsage || 'wifi');
        setLanguage(settings.language || 'ar');
        setVideoQuality(settings.videoQuality || 'auto');
        setSoundEnabled(settings.soundEnabled !== false);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }

    // تحميل بيانات الملف الشخصي
    if (user && !isGuest) {
      setProfileData({
        displayName: user.displayName || '',
        username: user.email?.split('@')[0] || '',
        bio: 'منشئ محتوى رقمي | أشارك رحلتي الإبداعية ✨',
        website: '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      });
    }
  }, [user, isGuest]);

  // حفظ الإعدادات في التخزين المحلي
  const saveSettings = () => {
    const settings = {
      darkMode,
      notifications,
      privateAccount,
      autoPlay,
      dataUsage,
      language,
      videoQuality,
      soundEnabled
    };
    
    try {
      localStorage.setItem('bix-settings', JSON.stringify(settings));
      
      // تطبيق الوضع المظلم
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      showToast({
        type: 'success',
        title: 'تم الحفظ',
        message: 'تم حفظ الإعدادات بنجاح.',
        duration: 3000
      });
    } catch (e) {
      console.error('Error saving settings:', e);
      showToast({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء حفظ الإعدادات.',
        duration: 3000
      });
    }
  };

  // تطبيق الإعدادات عند التغيير
  useEffect(() => {
    saveSettings();
  }, [darkMode, notifications, privateAccount, autoPlay, dataUsage, language, videoQuality, soundEnabled]);

  // وظيفة تسجيل الخروج
  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      
      showToast({
        type: 'success',
        title: 'تم تسجيل الخروج',
        message: 'تم تسجيل خروجك بنجاح.',
        duration: 3000
      });
      
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تسجيل الخروج.',
        duration: 3000
      });
    }
  };

  // وظيفة حذف الحساب
  const handleDeleteAccount = () => {
    // هنا سيتم تنفيذ منطق حذف الحساب الفعلي
    setIsDeleteAccountModalOpen(false);
    
    showToast({
      type: 'info',
      title: 'قريبًا',
      message: 'ستتوفر هذه الميزة قريبًا.',
      duration: 3000
    });
  };

  // وظيفة تحديث الملف الشخصي
  const handleUpdateProfile = () => {
    // هنا سيتم تنفيذ منطق تحديث الملف الشخصي الفعلي
    setIsEditProfileModalOpen(false);
    
    showToast({
      type: 'success',
      title: 'تم التحديث',
      message: 'تم تحديث الملف الشخصي بنجاح.',
      duration: 3000
    });
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 pb-20 flex items-center justify-center transition-colors duration-300">
        <TopNav />
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-300">
            <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 transition-colors duration-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
            يجب عليك تسجيل الدخول للوصول إلى الإعدادات
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            تسجيل الدخول
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20 transition-colors duration-300">
      <TopNav />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">الإعدادات</h1>
        </div>
      </div>

      {/* معلومات المستخدم */}
      <div className="bg-white dark:bg-gray-800 p-4 mb-4 transition-colors duration-300">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <Image
                src={user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="الصورة الشخصية"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1 mr-4 rtl:ml-4 rtl:mr-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {profileData.displayName || user?.displayName || 'مستخدم'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
              @{profileData.username || user?.email?.split('@')[0] || 'user'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 transition-colors duration-300">
              {profileData.email || user?.email}
            </p>
          </div>
          
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* أقسام الإعدادات */}
      <div className="space-y-4">
        {/* قسم الحساب */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 transition-colors duration-300" />
              <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">الحساب</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">حساب خاص</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">جعل حسابك مرئياً للمتابعين فقط</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <Switch
                    checked={privateAccount}
                    onChange={() => setPrivateAccount(!privateAccount)}
                    className={`${
                      privateAccount ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                  >
                    <span
                      className={`${
                        privateAccount ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* قسم الإشعارات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 transition-colors duration-300" />
              <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">الإشعارات</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">الإشعارات الفورية</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">تلقي إشعارات عند التفاعل مع محتواك</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <Switch
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    className={`${
                      notifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                  >
                    <span
                      className={`${
                        notifications ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* قسم التشغيل */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <VideoCameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 transition-colors duration-300" />
              <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">التشغيل</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">التشغيل التلقائي</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">تشغيل الفيديوهات تلقائياً</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <Switch
                    checked={autoPlay}
                    onChange={() => setAutoPlay(!autoPlay)}
                    className={`${
                      autoPlay ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                  >
                    <span
                      className={`${
                        autoPlay ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">الصوت</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">تشغيل الصوت افتراضياً</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <Switch
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled(!soundEnabled)}
                    className={`${
                      soundEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                  >
                    <span
                      className={`${
                        soundEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">جودة الفيديو</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">اختيار جودة التشغيل</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <select
                    value={videoQuality}
                    onChange={(e) => setVideoQuality(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 transition-colors duration-300"
                  >
                    <option value="auto">تلقائي</option>
                    <option value="high">عالية (1080p)</option>
                    <option value="medium">متوسطة (720p)</option>
                    <option value="low">منخفضة (480p)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* قسم المظهر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center">
              <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 transition-colors duration-300" />
              <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">المظهر</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">الوضع المظلم</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">تفعيل المظهر المظلم</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className={`${
                      darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                  >
                    <span
                      className={`${
                        darkMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">اللغة</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">اختيار لغة التطبيق</p>
                </div>
                
                <div className="mr-4 rtl:ml-4 rtl:mr-0">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 transition-colors duration-300"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* أزرار الإجراءات الخطيرة */}
      <div className="mt-8 space-y-4">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full bg-white dark:bg-gray-800 p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <div className="flex items-center">
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3 rtl:ml-3 rtl:mr-0 transition-colors duration-300" />
            <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">تسجيل الخروج</span>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
        </button>
        
        <button
          onClick={() => setIsDeleteAccountModalOpen(true)}
          className="w-full bg-white dark:bg-gray-800 p-4 flex items-center justify-between border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <div className="flex items-center">
            <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 rtl:ml-3 rtl:mr-0 transition-colors duration-300" />
            <span className="font-medium text-red-600 dark:text-red-400 transition-colors duration-300">حذف الحساب</span>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-red-400 dark:text-red-500 transition-colors duration-300" />
        </button>
      </div>

      {/* النوافذ المنبثقة */}
      {/* نافذة تأكيد تسجيل الخروج */}
      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsLogoutModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-center align-middle shadow-xl transition-all">
                  <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center transition-colors duration-300">
                    <ArrowRightOnRectangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                  </div>
                  
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2 transition-colors duration-300"
                  >
                    تسجيل الخروج
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                    هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟
                  </p>

                  <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                      onClick={() => setIsLogoutModalOpen(false)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* نافذة تأكيد حذف الحساب */}
      <Transition appear show={isDeleteAccountModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteAccountModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-center align-middle shadow-xl transition-all">
                  <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center transition-colors duration-300">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 transition-colors duration-300" />
                  </div>
                  
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2 transition-colors duration-300"
                  >
                    حذف الحساب
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                    هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك ومحتواك.
                  </p>

                  <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                      onClick={() => setIsDeleteAccountModalOpen(false)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                      onClick={handleDeleteAccount}
                    >
                      حذف الحساب
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <BottomNav />
    </div>
  );
}