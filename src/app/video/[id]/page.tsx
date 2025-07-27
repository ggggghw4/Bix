'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, ArrowLeftIcon, PaperAirplaneIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { mockVideos, mockComments } from '@/lib/mockData';

// Function to find video by ID
const findVideoById = (id: string) => {
  return mockVideos.find(video => video.id === id) || mockVideos[0];
};



export default function VideoPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState(findVideoById(id as string));
  const [videoComments, setVideoComments] = useState(mockComments[id as keyof typeof mockComments] || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [comment, setComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
    
    // Update video when ID changes
    setVideo(findVideoById(id as string));
    setVideoComments(mockComments[id as keyof typeof mockComments] || []);
    
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Error playing video:", e));
    }
  }, [id, user, loading, router]);

  const toggleLike = () => {
    setIsLiked(!isLiked);
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
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // In a real app, add the comment to Firestore
    // For now, we'll just update the local state
    const newComment = {
      id: `c${Date.now()}`,
      username: user?.displayName || user?.email?.split('@')[0] || 'Anonymous User',
      userImage: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
      text: comment,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    };
    
    setVideoComments([newComment, ...videoComments]);
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pb-16 bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold flex-1">Video</h1>
      </div>
      
      {/* Video Player */}
      <div className="relative bg-black">
        <div className="aspect-[9/16] max-h-[70vh]">
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full object-contain"
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlayPause}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlayPause}
            >
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
                </svg>
              </div>
            </div>
          )}
          
          {/* Video Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <button 
              onClick={toggleMute}
              className="bg-black bg-opacity-50 rounded-full p-2 text-white"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div className="flex items-center">
              <MusicalNoteIcon className="h-5 w-5 text-white mr-2" />
              <p className="text-white text-sm">{video.audioTitle || "Original Sound"}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${video.username}`} className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image
                src={video.userImage}
                alt={video.username}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium">@{video.username}</p>
              <p className="text-xs text-gray-500">Original creator</p>
            </div>
          </Link>
          
          <button className="px-4 py-1 border border-indigo-600 text-indigo-600 rounded-full text-sm font-medium">
            Follow
          </button>
        </div>
        
        <p className="mb-2">{video.caption}</p>
        
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap mb-2">
            {video.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/discover?tag=${tag}`}
                className="text-indigo-600 font-medium mr-2"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-4">
            <button
              onClick={toggleLike}
              className="flex items-center"
            >
              {isLiked ? (
                <HeartIconSolid className="h-6 w-6 text-red-500 mr-1" />
              ) : (
                <HeartIcon className="h-6 w-6 mr-1" />
              )}
              <span>{isLiked ? video.likes + 1 : video.likes}</span>
            </button>
            
            <div className="flex items-center">
              <ChatBubbleOvalLeftIcon className="h-6 w-6 mr-1" />
              <span>{videoComments.length}</span>
            </div>
            
            <button className="flex items-center">
              <ShareIcon className="h-6 w-6 mr-1" />
              <span>{video.shares}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="p-4">
        <h2 className="font-bold mb-4">Comments ({videoComments.length})</h2>
        
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
              <Image
                src={user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt={user?.displayName || 'User'}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-100 px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className={`ml-2 p-2 rounded-full ${
                comment.trim() ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
            </button>
          </div>
        </form>
        
        <div className="space-y-4">
          {videoComments.map((comment) => (
            <div key={comment.id} className="flex mb-4">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <Image
                  src={comment.userImage}
                  alt={comment.username}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center">
                    <span className="font-medium text-sm mr-2">@{comment.username}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span className="mr-3">{comment.timestamp}</span>
                  <button className="mr-3">Reply</button>
                  <button className="flex items-center">
                    <HeartIcon className="h-3 w-3 mr-1" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex">
                        <div className="h-6 w-6 rounded-full overflow-hidden mr-2 flex-shrink-0">
                          <Image
                            src={reply.userImage}
                            alt={reply.username}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg px-3 py-2">
                            <div className="flex items-center">
                              <span className="font-medium text-xs mr-2">@{reply.username}</span>
                            </div>
                            <p className="text-xs">{reply.text}</p>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span className="mr-3">{reply.timestamp}</span>
                            <button className="flex items-center">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}