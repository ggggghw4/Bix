'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/layout/ToastManager';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// تعريف أنواع البيانات
type FAQCategory = {
  id: string;
  title: string;
  icon: React.ElementType;
  questions: FAQ[];
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function HelpPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // فئات الأسئلة الشائعة
  const faqCategories: FAQCategory[] = [
    {
      id: 'general',
      title: 'أسئلة عامة',
      icon: QuestionMarkCircleIcon,
      questions: [
        {
          id: 'what-is-bix',
          question: 'ما هو تطبيق بيكس؟',
          answer: 'بيكس هو منصة لمشاركة مقاطع الفيديو القصيرة، حيث يمكنك إنشاء ومشاركة ومشاهدة مقاطع فيديو إبداعية. يمكنك التفاعل مع المحتوى من خلال الإعجابات والتعليقات والمشاركة، ومتابعة المبدعين المفضلين لديك.'
        },
        {
          id: 'how-to-create-account',
          question: 'كيف يمكنني إنشاء حساب؟',
          answer: 'يمكنك إنشاء حساب بسهولة عن طريق النقر على زر "تسجيل الدخول" في الشاشة الرئيسية، ثم اختيار "إنشاء حساب جديد". يمكنك التسجيل باستخدام بريدك الإلكتروني أو من خلال حسابات التواصل الاجتماعي مثل Google أو Facebook.'
        },
        {
          id: 'is-bix-free',
          question: 'هل تطبيق بيكس مجاني؟',
          answer: 'نعم، تطبيق بيكس مجاني تمامًا للاستخدام. يمكنك مشاهدة وإنشاء ومشاركة المحتوى دون أي تكلفة. قد تكون هناك بعض الميزات المتقدمة متاحة في المستقبل كجزء من اشتراك مدفوع، ولكن الوظائف الأساسية ستظل مجانية دائمًا.'
        },
        {
          id: 'supported-devices',
          question: 'ما هي الأجهزة المدعومة؟',
          answer: 'يمكن استخدام بيكس على مجموعة متنوعة من الأجهزة. التطبيق متاح كموقع ويب يعمل على جميع المتصفحات الحديثة، وكتطبيق للهواتف الذكية على أنظمة Android و iOS. يمكنك أيضًا استخدامه على الأجهزة اللوحية وأجهزة الكمبيوتر المكتبية.'
        }
      ]
    },
    {
      id: 'account',
      title: 'الحساب والملف الشخصي',
      icon: UserIcon,
      questions: [
        {
          id: 'edit-profile',
          question: 'كيف يمكنني تعديل ملفي الشخصي؟',
          answer: 'لتعديل ملفك الشخصي، انتقل إلى صفحة "حسابي" من خلال النقر على أيقونة الملف الشخصي في شريط التنقل السفلي. ثم انقر على زر "تعديل الملف الشخصي" لتغيير صورتك الشخصية، اسم المستخدم، السيرة الذاتية، وغيرها من المعلومات.'
        },
        {
          id: 'change-password',
          question: 'كيف يمكنني تغيير كلمة المرور؟',
          answer: 'لتغيير كلمة المرور، انتقل إلى صفحة "الإعدادات" من خلال الملف الشخصي، ثم اختر "الأمان" أو "تغيير كلمة المرور". ستحتاج إلى إدخال كلمة المرور الحالية ثم كلمة المرور الجديدة مرتين للتأكيد.'
        },
        {
          id: 'delete-account',
          question: 'كيف يمكنني حذف حسابي؟',
          answer: 'لحذف حسابك، انتقل إلى "الإعدادات" ثم "الحساب" ثم "حذف الحساب". يرجى ملاحظة أن حذف الحساب سيؤدي إلى إزالة جميع بياناتك ومحتواك بشكل دائم ولا يمكن التراجع عن هذه العملية.'
        },
        {
          id: 'recover-account',
          question: 'نسيت كلمة المرور، كيف يمكنني استعادة حسابي؟',
          answer: 'إذا نسيت كلمة المرور، انقر على "نسيت كلمة المرور؟" في صفحة تسجيل الدخول. أدخل بريدك الإلكتروني المرتبط بحسابك وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. اتبع التعليمات في البريد الإلكتروني لإنشاء كلمة مرور جديدة.'
        }
      ]
    },
    {
      id: 'content',
      title: 'إنشاء ومشاركة المحتوى',
      icon: VideoCameraIcon,
      questions: [
        {
          id: 'upload-video',
          question: 'كيف يمكنني تحميل فيديو؟',
          answer: 'لتحميل فيديو، انقر على زر "+" في شريط التنقل السفلي. يمكنك اختيار فيديو من مكتبة الوسائط الخاصة بك أو تسجيل فيديو جديد مباشرة من التطبيق. بعد اختيار الفيديو، يمكنك تعديله بإضافة فلاتر، موسيقى، نص، وتأثيرات قبل النشر.'
        },
        {
          id: 'video-requirements',
          question: 'ما هي متطلبات الفيديو؟',
          answer: 'يدعم بيكس مقاطع الفيديو بطول يتراوح بين 15 ثانية و3 دقائق. يجب أن يكون الفيديو بتنسيق MP4 أو MOV، وبدقة لا تقل عن 720p. الحد الأقصى لحجم الملف هو 500 ميجابايت. يرجى الالتزام بإرشادات المجتمع عند نشر المحتوى.'
        },
        {
          id: 'edit-video',
          question: 'كيف يمكنني تعديل الفيديو قبل النشر؟',
          answer: 'بعد اختيار الفيديو للتحميل، ستنتقل إلى شاشة التعديل حيث يمكنك: إضافة فلاتر وتأثيرات، قص الفيديو لضبط المدة، إضافة موسيقى أو تغيير الصوت، إضافة نص وملصقات، وضبط سرعة الفيديو. انقر على "التالي" بعد الانتهاء من التعديل لإضافة وصف وهاشتاغات قبل النشر.'
        },
        {
          id: 'delete-video',
          question: 'كيف يمكنني حذف فيديو قمت بنشره؟',
          answer: 'لحذف فيديو قمت بنشره، انتقل إلى ملفك الشخصي وابحث عن الفيديو الذي تريد حذفه. انقر على الفيديو لفتحه، ثم انقر على أيقونة القائمة (ثلاث نقاط) واختر "حذف". سيُطلب منك تأكيد الحذف قبل إزالة الفيديو نهائيًا.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      icon: LockClosedIcon,
      questions: [
        {
          id: 'privacy-settings',
          question: 'كيف يمكنني تغيير إعدادات الخصوصية؟',
          answer: 'لتغيير إعدادات الخصوصية، انتقل إلى "الإعدادات" ثم "الخصوصية". هناك يمكنك تحديد من يمكنه مشاهدة مقاطع الفيديو الخاصة بك، من يمكنه التعليق، ومن يمكنه إرسال رسائل إليك. يمكنك أيضًا تعيين حسابك كخاص بحيث يحتاج المستخدمون الجدد إلى موافقتك قبل متابعتك.'
        },
        {
          id: 'block-user',
          question: 'كيف يمكنني حظر مستخدم؟',
          answer: 'لحظر مستخدم، انتقل إلى ملفه الشخصي، ثم انقر على أيقونة القائمة (ثلاث نقاط) في الزاوية العلوية واختر "حظر المستخدم". سيتم منع هذا المستخدم من رؤية محتواك أو التفاعل معك، ولن تظهر محتوياته في تغذيتك.'
        },
        {
          id: 'report-content',
          question: 'كيف يمكنني الإبلاغ عن محتوى غير لائق؟',
          answer: 'للإبلاغ عن محتوى غير لائق، انقر على أيقونة المشاركة (السهم) على الفيديو، ثم اختر "الإبلاغ". حدد سبب الإبلاغ من القائمة وقدم أي معلومات إضافية إذا طُلب منك ذلك. سيقوم فريقنا بمراجعة التقرير واتخاذ الإجراء المناسب.'
        },
        {
          id: 'data-collection',
          question: 'ما هي البيانات التي يجمعها التطبيق عني؟',
          answer: 'يجمع بيكس بعض البيانات لتحسين تجربتك، بما في ذلك معلومات الملف الشخصي، تفضيلات المحتوى، وبيانات الاستخدام. نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. يمكنك الاطلاع على سياسة الخصوصية الكاملة في قسم "الإعدادات" > "الخصوصية" > "سياسة الخصوصية".'
        }
      ]
    },
    {
      id: 'technical',
      title: 'مشاكل تقنية',
      icon: ArrowPathIcon,
      questions: [
        {
          id: 'app-crashing',
          question: 'التطبيق يتوقف فجأة، ماذا أفعل؟',
          answer: 'إذا كان التطبيق يتوقف فجأة، جرب الخطوات التالية: 1) أعد تشغيل التطبيق، 2) تأكد من تحديث التطبيق إلى أحدث إصدار، 3) أعد تشغيل جهازك، 4) تحقق من اتصالك بالإنترنت، 5) امسح ذاكرة التخزين المؤقت للتطبيق من إعدادات جهازك. إذا استمرت المشكلة، يرجى الاتصال بفريق الدعم.'
        },
        {
          id: 'video-not-loading',
          question: 'الفيديوهات لا تُحمَّل، كيف يمكنني إصلاح ذلك؟',
          answer: 'إذا كانت الفيديوهات لا تُحمَّل، تحقق من اتصالك بالإنترنت أولاً. جرب التبديل بين Wi-Fi وبيانات الهاتف. يمكنك أيضًا تجربة: 1) تحديث التطبيق، 2) مسح ذاكرة التخزين المؤقت، 3) ضبط جودة الفيديو في الإعدادات إلى مستوى أقل إذا كان اتصالك بطيئًا، 4) إعادة تشغيل الجهاز.'
        },
        {
          id: 'upload-failed',
          question: 'فشل تحميل الفيديو الخاص بي، ما السبب؟',
          answer: 'قد يفشل تحميل الفيديو لعدة أسباب: 1) اتصال إنترنت ضعيف أو غير مستقر، 2) حجم الفيديو أكبر من الحد المسموح به (500 ميجابايت)، 3) تنسيق الفيديو غير مدعوم، 4) مشكلة مؤقتة في الخوادم. حاول تقليل حجم الفيديو أو تحويله إلى تنسيق MP4، وتأكد من استقرار اتصالك بالإنترنت قبل المحاولة مرة أخرى.'
        },
        {
          id: 'offline-mode',
          question: 'هل يمكنني استخدام التطبيق بدون إنترنت؟',
          answer: 'يمكنك استخدام بعض ميزات بيكس في وضع عدم الاتصال، مثل مشاهدة الفيديوهات التي تم تحميلها مسبقًا وتحرير مقاطع الفيديو المحفوظة على جهازك. ومع ذلك، ستحتاج إلى اتصال بالإنترنت لتحميل فيديوهات جديدة، والتفاعل مع المحتوى، وتحديث التغذية الخاصة بك.'
        }
      ]
    }
  ];

  // التبديل بين توسيع/طي السؤال
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // التحقق مما إذا كان السؤال موسعًا
  const isQuestionExpanded = (questionId: string) => {
    return expandedQuestions.includes(questionId);
  };

  // الحصول على الفئة النشطة
  const getActiveCategory = () => {
    return faqCategories.find(category => category.id === activeCategory) || faqCategories[0];
  };

  // معالجة تغييرات نموذج الاتصال
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // إرسال نموذج الاتصال
  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة تأخير الشبكة
    setTimeout(() => {
      setIsSubmitting(false);
      
      // إعادة تعيين النموذج
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // إظهار رسالة نجاح
      showToast({
        type: 'success',
        title: 'تم الإرسال',
        message: 'تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.',
        duration: 5000
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20 transition-colors duration-300">
      {/* شريط التنقل العلوي */}
      <TopNav />
      
      {/* رأس الصفحة */}
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white py-8 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">مركز المساعدة</h1>
          <p className="text-indigo-100 dark:text-indigo-200 transition-colors duration-300">
            كيف يمكننا مساعدتك اليوم؟ ابحث عن إجابات لأسئلتك أو تواصل معنا مباشرة.
          </p>
          
          {/* مربع البحث */}
          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="ابحث عن سؤال..."
              className="w-full py-3 px-4 pr-12 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-colors duration-300"
            />
            <div className="absolute left-3 top-3">
              <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
      
      {/* محتوى الصفحة */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* أقسام المساعدة */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-lg text-center transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <category.icon className={`h-8 w-8 mx-auto mb-2 ${
                activeCategory === category.id
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              } transition-colors duration-300`} />
              <span className="text-sm font-medium">{category.title}</span>
            </button>
          ))}
        </div>
        
        {/* الأسئلة الشائعة */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">
            {getActiveCategory().title}
          </h2>
          
          <div className="space-y-4">
            {getActiveCategory().questions.map((faq) => (
              <div 
                key={faq.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300"
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-right bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    {faq.question}
                  </span>
                  {isQuestionExpanded(faq.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                  )}
                </button>
                
                {isQuestionExpanded(faq.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* نموذج الاتصال */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">
            تواصل معنا
          </h2>
          
          <form onSubmit={handleContactFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                الموضوع
              </label>
              <select
                id="subject"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactFormChange}
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
              >
                <option value="">اختر موضوعًا...</option>
                <option value="account">مشكلة في الحساب</option>
                <option value="technical">مشكلة تقنية</option>
                <option value="content">الإبلاغ عن محتوى</option>
                <option value="suggestion">اقتراح</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                الرسالة
              </label>
              <textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleContactFormChange}
                required
                rows={5}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  جارِ الإرسال...
                </span>
              ) : (
                'إرسال الرسالة'
              )}
            </button>
          </form>
        </div>
        
        {/* روابط مفيدة */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">
            روابط مفيدة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/terms" className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <DocumentTextIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3 transition-colors duration-300" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">شروط الاستخدام</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">اطلع على شروط استخدام المنصة</p>
              </div>
            </Link>
            
            <Link href="/privacy" className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3 transition-colors duration-300" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">سياسة الخصوصية</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">كيف نتعامل مع بياناتك الشخصية</p>
              </div>
            </Link>
            
            <Link href="/community-guidelines" className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <ExclamationTriangleIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3 transition-colors duration-300" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">إرشادات المجتمع</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">قواعد النشر والتفاعل على المنصة</p>
              </div>
            </Link>
            
            <Link href="/tutorials" className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <LightBulbIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3 transition-colors duration-300" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">دروس تعليمية</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">تعلم كيفية استخدام ميزات التطبيق</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* شريط التنقل السفلي */}
      <BottomNav />
    </div>
  );
}