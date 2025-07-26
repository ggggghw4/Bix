'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/layout/ToastManager';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { validateCaption } from '@/lib/utils/contentFilter';
import { 
  ArrowLeftIcon, 
  HashtagIcon, 
  MusicalNoteIcon, 
  PhotoIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  CheckIcon,
  CameraIcon,
  VideoCameraIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function UploadPage() {
  const { user, loading, isGuest } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  // حالة الملف والمعاينة
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image' | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // حالة المحتوى
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [sound, setSound] = useState('Original Sound');
  
  // حالة التحميل
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  // حالة واجهة المستخدم
  const [mode, setMode] = useState<'select' | 'form' | 'capture' | 'edit'>('select');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuets, setAllowDuets] = useState(true);
  
  // المراجع
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // إذا كان المستخدم ضيفًا، نعرض رسالة تحذير
  useEffect(() => {
    if (!loading && isGuest) {
      showToast({
        type: 'warning',
        title: 'تسجيل الدخول مطلوب',
        message: 'يجب عليك تسجيل الدخول لتتمكن من تحميل الفيديوهات.',
        duration: 5000,
        action: {
          text: 'تسجيل الدخول',
          onClick: () => router.push('/auth')
        }
      });
    }
  }, [loading, isGuest, router, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  // معالجة اختيار ملف من المستعرض
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // التحقق من نوع الملف
      if (selectedFile.type.startsWith('video/')) {
        handleVideoFile(selectedFile);
      } else if (selectedFile.type.startsWith('image/')) {
        handleImageFile(selectedFile);
      } else {
        setError('يرجى اختيار ملف فيديو أو صورة');
        showToast({
          type: 'error',
          title: 'نوع ملف غير مدعوم',
          message: 'يرجى اختيار ملف فيديو أو صورة.',
          duration: 3000
        });
      }
    }
  };
  
  // معالجة ملف فيديو
  const handleVideoFile = (selectedFile: File) => {
    // التحقق من حجم الملف (الحد الأقصى 100 ميجابايت)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('يجب أن يكون حجم الملف أقل من 100 ميجابايت');
      showToast({
        type: 'error',
        title: 'الملف كبير جدًا',
        message: 'يجب أن يكون حجم الملف أقل من 100 ميجابايت.',
        duration: 3000
      });
      return;
    }
    
    setFile(selectedFile);
    setFileType('video');
    
    // إنشاء عنوان للصوت من اسم الملف
    const fileName = selectedFile.name.split('.')[0];
    setSound(`Original Sound - ${fileName}`);
    
    // إنشاء معاينة للفيديو
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
    
    // الانتقال إلى وضع النموذج
    setMode('form');
    
    setError('');
  };
  
  // معالجة ملف صورة
  const handleImageFile = (selectedFile: File) => {
    // التحقق من حجم الملف (الحد الأقصى 10 ميجابايت)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('يجب أن يكون حجم الملف أقل من 10 ميجابايت');
      showToast({
        type: 'error',
        title: 'الملف كبير جدًا',
        message: 'يجب أن يكون حجم الصورة أقل من 10 ميجابايت.',
        duration: 3000
      });
      return;
    }
    
    setFile(selectedFile);
    setFileType('image');
    
    // إنشاء معاينة للصورة
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
    
    // الانتقال إلى وضع النموذج
    setMode('form');
    
    setError('');
  };
  
  // وظيفة معالجة تحميل الصورة المصغرة
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // التحقق من أن الملف هو صورة
      if (!selectedFile.type.startsWith('image/')) {
        showToast({
          type: 'error',
          title: 'خطأ في الملف',
          message: 'يرجى اختيار ملف صورة صالح.',
          duration: 3000
        });
        return;
      }
      
      setThumbnailFile(selectedFile);
      
      // إنشاء معاينة للصورة
      const imageUrl = URL.createObjectURL(selectedFile);
      setThumbnailPreview(imageUrl);
    }
  };

  // وظيفة التقاط صورة مصغرة من الفيديو
  const captureVideoThumbnail = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
          setThumbnailFile(file);
          
          const imageUrl = URL.createObjectURL(blob);
          setThumbnailPreview(imageUrl);
          
          showToast({
            type: 'success',
            title: 'تم التقاط الصورة المصغرة',
            message: 'تم التقاط الصورة المصغرة من الفيديو بنجاح.',
            duration: 3000
          });
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // وظيفة إضافة وسم
  const addTag = () => {
    if (tagInput.trim() && !tagsList.includes(tagInput.trim().toLowerCase())) {
      setTagsList([...tagsList, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  // وظيفة حذف وسم
  const removeTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
  };

  // وظيفة معالجة إضافة وسم عند الضغط على Enter
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // إعادة تعيين الحالة
  const resetState = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    
    setFile(null);
    setFileType(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setPreview(null);
    setCaption('');
    setTagsList([]);
    setTagInput('');
    setSound('Original Sound');
    setProgress(0);
    setError('');
    setMode('select');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('يرجى اختيار وسائط للتحميل');
      showToast({
        type: 'error',
        title: 'خطأ في التحميل',
        message: 'يرجى اختيار فيديو أو صورة للتحميل.',
        duration: 3000
      });
      return;
    }

    if (!caption.trim()) {
      setError('يرجى إضافة وصف');
      showToast({
        type: 'error',
        title: 'خطأ في التحميل',
        message: 'يرجى إضافة وصف للمحتوى.',
        duration: 3000
      });
      return;
    }
    
    // التحقق من المحتوى غير اللائق في الوصف
    const captionValidation = validateCaption(caption);
    if (!captionValidation.isValid) {
      setError(captionValidation.message || 'الوصف يحتوي على محتوى غير لائق');
      showToast({
        type: 'error',
        title: 'محتوى غير لائق',
        message: captionValidation.message || 'يرجى تجنب استخدام لغة غير لائقة في الوصف',
        duration: 3000
      });
      return;
    }

    setIsUploading(true);
    setError('');
    
    // تنظيف عنوان URL للمعاينة
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    try {
      // إنشاء معرف فريد للمحتوى
      const contentId = `${fileType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `${user.uid}_${contentId}`;
      
      // المسار في Firebase Storage
      const contentPath = fileType === 'video' ? 'videos' : 'images';
      const contentStorageRef = ref(storage, `${contentPath}/${fileName}`);
      
      // تحميل ملف الوسائط
      const uploadTask = uploadBytesResumable(contentStorageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // تتبع تقدم التحميل
          const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressValue);
        },
        (error) => {
          setError(`خطأ في تحميل ${fileType === 'video' ? 'الفيديو' : 'الصورة'}: ${error.message}`);
          setIsUploading(false);
          showToast({
            type: 'error',
            title: 'خطأ في التحميل',
            message: `حدث خطأ أثناء تحميل ${fileType === 'video' ? 'الفيديو' : 'الصورة'}. يرجى المحاولة مرة أخرى.`,
            duration: 3000
          });
        },
        async () => {
          // تم تحميل الوسائط بنجاح
          const contentUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // تحميل الصورة المصغرة إذا كانت موجودة (للفيديو فقط)
          let thumbnailUrl = '';
          
          if (fileType === 'video' && thumbnailFile) {
            const thumbnailStorageRef = ref(storage, `thumbnails/${fileName}`);
            const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, thumbnailFile);
            
            await new Promise<void>((resolve, reject) => {
              thumbnailUploadTask.on(
                'state_changed',
                null,
                (error) => {
                  reject(error);
                },
                () => {
                  resolve();
                }
              );
            });
            
            thumbnailUrl = await getDownloadURL(thumbnailStorageRef);
          }
          
          // حفظ البيانات في Firestore
          const collectionName = fileType === 'video' ? 'videos' : 'images';
          
          await addDoc(collection(db, collectionName), {
            id: contentId,
            type: fileType,
            userId: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'مستخدم مجهول',
            userImage: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
            caption: captionValidation.cleanedCaption,
            [fileType === 'video' ? 'videoUrl' : 'imageUrl']: contentUrl,
            thumbnailUrl: fileType === 'video' ? thumbnailUrl : '',
            audioTitle: fileType === 'video' ? sound : '',
            tags: tagsList,
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            isPrivate,
            allowComments,
            allowDuets: fileType === 'video' ? allowDuets : false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // إعادة تعيين الحالة
          resetState();
          
          showToast({
            type: 'success',
            title: 'تم التحميل بنجاح',
            message: `تم تحميل ${fileType === 'video' ? 'الفيديو' : 'الصورة'} بنجاح!`,
            duration: 3000
          });
          
          // إعادة توجيه المستخدم إلى صفحة التغذية
          router.push('/feed');
        }
      );
    } catch (err: any) {
      setError(`خطأ في التحميل: ${err.message}`);
      setIsUploading(false);
      showToast({
        type: 'error',
        title: 'خطأ في التحميل',
        message: 'حدث خطأ أثناء التحميل. يرجى المحاولة مرة أخرى.',
        duration: 3000
      });
    }
  };

  // إذا كان المستخدم ضيفًا، نعرض رسالة تحذير
  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <TopNav />
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">تسجيل الدخول مطلوب</h2>
              <p className="text-yellow-700">
                يجب عليك تسجيل الدخول لتتمكن من تحميل الفيديوهات.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16 pb-20">
      <TopNav />
      
      {/* وضع اختيار الوسائط أو نموذج التحميل */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="ml-4 rtl:mr-4 rtl:ml-0"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold">إنشاء محتوى جديد</h1>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* وضع اختيار الوسائط */}
          {mode === 'select' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 text-center">اختر نوع المحتوى</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* خيار الكاميرا */}
                <button
                  onClick={() => setMode('capture')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 flex flex-col items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition shadow-md"
                >
                  <CameraIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-bold">التقاط من الكاميرا</h3>
                  <p className="text-sm mt-2 text-center">التقط صورة أو فيديو مباشرة من كاميرا جهازك</p>
                </button>
                
                {/* خيار تحميل ملف */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg p-6 flex flex-col items-center justify-center hover:from-blue-600 hover:to-teal-600 transition shadow-md"
                >
                  <ArrowUpTrayIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-bold">تحميل من الجهاز</h3>
                  <p className="text-sm mt-2 text-center">اختر صورة أو فيديو من جهازك</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*,image/*"
                    className="hidden" 
                  />
                </button>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">أفكار للمحتوى</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <SparklesIcon className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm">شارك لحظاتك المميزة</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <MusicalNoteIcon className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm">أنشئ فيديو موسيقي</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <VideoCameraIcon className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm">شارك مهاراتك</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <AdjustmentsHorizontalIcon className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm">جرب فلاتر جديدة</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* وضع نموذج التحميل */}
          {mode === 'form' && file && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* منطقة معاينة الوسائط */}
                <div>
                  <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    {fileType === 'video' ? (
                      <video
                        ref={videoRef}
                        src={preview || undefined}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={preview || ''}
                        alt="معاينة الصورة"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      onClick={() => setMode('edit')}
                      className="absolute bottom-4 right-4 bg-white text-indigo-600 rounded-full p-2 shadow-md"
                    >
                      <AdjustmentsHorizontalIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* الصورة المصغرة (للفيديو فقط) */}
                  {fileType === 'video' && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">الصورة المصغرة</h3>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                          {thumbnailPreview ? (
                            <img
                              src={thumbnailPreview || ''}
                              alt="معاينة الصورة المصغرة"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <button
                            type="button"
                            onClick={captureVideoThumbnail}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
                          >
                            التقاط من الفيديو
                          </button>
                          
                          <label className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition cursor-pointer text-center">
                            تحميل صورة
                            <input
                              type="file"
                              ref={thumbnailInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleThumbnailUpload}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* نموذج المعلومات */}
                <div>
                  {/* الوصف */}
                  <div className="mb-4">
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="اكتب وصفًا..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-left">
                      {caption.length}/200
                    </p>
                  </div>
                  
                  {/* الوسوم */}
                  <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      الوسوم
                    </label>
                    <div className="flex items-center">
                      <div className="relative flex-grow">
                        <HashtagIcon className="h-5 w-5 text-gray-400 absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          className="w-full pr-10 rtl:pl-10 rtl:pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="أضف وسومًا (اضغط Enter للإضافة)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTag}
                        className="mr-2 rtl:ml-2 rtl:mr-0 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* عرض الوسوم */}
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tagsList.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="mr-1 rtl:ml-1 rtl:mr-0 text-indigo-600 hover:text-indigo-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* الصوت (للفيديو فقط) */}
                  {fileType === 'video' && (
                    <div className="mb-4">
                      <label htmlFor="sound" className="block text-sm font-medium text-gray-700 mb-1">
                        الصوت
                      </label>
                      <div className="relative">
                        <MusicalNoteIcon className="h-5 w-5 text-gray-400 absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          id="sound"
                          value={sound}
                          onChange={(e) => setSound(e.target.value)}
                          className="w-full pr-10 rtl:pl-10 rtl:pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="اسم الصوت الأصلي"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* خيارات الخصوصية */}
                  <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">خيارات الخصوصية</h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">محتوى خاص</span>
                      <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          isPrivate ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPrivate ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">السماح بالتعليقات</span>
                      <button
                        type="button"
                        onClick={() => setAllowComments(!allowComments)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          allowComments ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            allowComments ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {fileType === 'video' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">السماح بالثنائيات</span>
                        <button
                          type="button"
                          onClick={() => setAllowDuets(!allowDuets)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            allowDuets ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              allowDuets ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* تقدم التحميل */}
                  {isUploading && (
                    <div className="mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 text-center">
                        جارٍ التحميل: {progress.toFixed(0)}%
                      </p>
                    </div>
                  )}
                  
                  {/* أزرار الإجراءات */}
                  <div className="flex justify-end space-x-4 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={resetState}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                      disabled={isUploading}
                    >
                      إلغاء
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading || !file || !caption.trim()}
                      className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
                        isUploading || !file || !caption.trim()
                          ? 'bg-indigo-300 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <span className="mr-2 rtl:ml-2 rtl:mr-0 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                          جارٍ التحميل...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-1 rtl:ml-1 rtl:mr-0" />
                          نشر
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
      <BottomNav />
    </div>
  );
}