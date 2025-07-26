'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon, 
  BookmarkIcon, 
  MusicalNoteIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useToast } from '@/components/layout/ToastManager';
import { throttle } from '@/lib/utils/performance';

type VideoCardProps = {
  video: {
    id: string;
    username: string;
    userImage: string;
    caption: string;
    videoUrl: string;
    audioTitle?: string;
    likes: number;
    comments: number;
    shares: number;
    tags?: string[];
  };
  isCompact?: boolean;
  autoPlay?: boolean;
  onVideoEnd?: () => void;
};

function VideoCard({
  video,
  isCompact = false,
  autoPlay = false,
  onVideoEnd
}: VideoCardProps) {
  const { 
    id, 
    username, 
    userImage, 
    caption, 
    videoUrl, 
    audioTitle = "Original Sound", 
    likes, 
    comments, 
    shares,
    tags = []
  } = video;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  // استخدام try/catch لتجنب الأخطاء إذا كان useToast غير متاح
  const toast = (() => {
    try {
      return useToast();
    } catch (error) {
      console.error('Error using useToast:', error);
      return { showToast: () => {} };
    }
  })();

  // Handle intersection observer for autoplay when in view
  useEffect(() => {
    if (!videoContainerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } // 60% of the video must be visible
    );
    
    observer.observe(videoContainerRef.current);
    
    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current);
      }
    };
  }, []);
  
  // Handle autoplay when in view
  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        // إضافة تأخير صغير قبل محاولة التشغيل لضمان تحميل الفيديو
        const playTimer = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch((error) => {
                console.error("Error playing video:", error);
                // محاولة إعادة التشغيل مرة أخرى بعد تأخير
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                      .then(() => setIsPlaying(true))
                      .catch(e => console.error("Second attempt failed:", e));
                  }
                }, 1000);
              });
          }
        }, 300);
        
        return () => clearTimeout(playTimer);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isInView]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // إظهار إشعار عند الإعجاب
    if (newLikedState && toast.showToast) {
      toast.showToast({
        type: 'success',
        title: 'تم الإعجاب',
        message: `تم إضافة الفيديو إلى قائمة إعجاباتك`,
        duration: 3000,
        link: `/video/${id}`
      });
    }
  };
  
  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    // إظهار إشعار عند الحفظ
    if (newSavedState && toast.showToast) {
      toast.showToast({
        type: 'info',
        title: 'تم الحفظ',
        message: `تم حفظ الفيديو في مجموعتك`,
        duration: 3000
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    } else {
      // Loop the video by default
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Error replaying video:", e));
      }
    }
  };

  // Compact view for discover page
  if (isCompact) {
    return (
      <Link href={`/video/${id}`} className="block w-full h-full">
        <div className="relative w-full h-full bg-black">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full overflow-hidden mr-1">
                <Image
                  src={userImage}
                  alt={username}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
              <p className="text-white text-xs truncate">{username}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full view for feed
  return (
    <div 
      ref={videoContainerRef}
      className="relative h-screen w-full snap-start bg-black overflow-hidden"
    >
      {/* Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          onClick={togglePlayPause}
          onEnded={handleVideoEnd}
        />
      </div>
      
      {/* Overlay for play/pause */}
      <div 
        className="absolute inset-0 z-10"
        onClick={togglePlayPause}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-20">
        <div className="flex items-end">
          <div className="flex-1">
            <Link href={`/profile/${username}`} className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mr-3">
                <Image
                  src={userImage}
                  alt={username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="font-medium text-white">@{username}</span>
            </Link>
            
            <p className="text-white mb-2">{caption}</p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap mb-2">
                {tags.map((tag, index) => (
                  <Link 
                    key={index} 
                    href={`/discover?tag=${tag}`}
                    className="text-white font-medium mr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex items-center">
              <MusicalNoteIcon className="h-4 w-4 text-white mr-1" />
              <p className="text-white text-sm">{audioTitle}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleLike}
          className="flex flex-col items-center"
        >
          <div className="bg-black/30 rounded-full p-2">
            {isLiked ? (
              <HeartIconSolid className="h-8 w-8 text-red-500" />
            ) : (
              <HeartIcon className="h-8 w-8 text-white" />
            )}
          </div>
          <span className="text-white text-xs mt-1">{isLiked ? likes + 1 : likes}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
        >
          <Link href={`/video/${id}`} className="bg-black/30 rounded-full p-2">
            <ChatBubbleOvalLeftIcon className="h-8 w-8 text-white" />
          </Link>
          <span className="text-white text-xs mt-1">{comments}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
        >
          <div className="bg-black/30 rounded-full p-2">
            <ShareIcon className="h-8 w-8 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{shares}</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSave}
          className="flex flex-col items-center"
        >
          <div className="bg-black/30 rounded-full p-2">
            {isSaved ? (
              <BookmarkIconSolid className="h-8 w-8 text-yellow-500" />
            ) : (
              <BookmarkIcon className="h-8 w-8 text-white" />
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}

// تصدير المكون مع تحسين الأداء باستخدام memo
export default memo(VideoCard);