import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  updateProfile,
  User
} from 'firebase/auth';

import { db, auth, storage } from '../firebase';

// Types
export type FirebaseUser = {
  uid: string;
  username: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  followers?: number;
  following?: number;
  isVerified?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type FirebaseVideo = {
  id?: string;
  userId: string;
  username: string;
  userImage?: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  audioTitle?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  tags: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type FirebaseComment = {
  id?: string;
  videoId: string;
  userId: string;
  username: string;
  userImage?: string;
  text: string;
  likes: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  parentId?: string; // للردود على التعليقات
};

// Authentication Services
export const authService = {
  // تسجيل مستخدم جديد بالبريد الإلكتروني وكلمة المرور
  async registerWithEmail(email: string, password: string, username: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // تحديث الملف الشخصي
      await updateProfile(user, {
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
      });
      
      // إنشاء وثيقة المستخدم في Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        displayName,
        email,
        photoURL: user.photoURL,
        bio: '',
        followers: 0,
        following: 0,
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error registering with email:', error);
      throw error;
    }
  },
  
  // تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in with email:', error);
      throw error;
    }
  },
  
  // تسجيل الدخول بحساب Google
  async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // التحقق مما إذا كان المستخدم موجودًا بالفعل في Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // إنشاء مستخدم جديد في Firestore
        const username = `user_${user.uid.substring(0, 8)}`;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username,
          displayName: user.displayName || username,
          email: user.email,
          photoURL: user.photoURL,
          bio: '',
          followers: 0,
          following: 0,
          isVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  },
  
  // تسجيل الدخول كضيف
  async loginAnonymously(): Promise<User> {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      // إنشاء وثيقة المستخدم الضيف في Firestore
      const username = `guest_${user.uid.substring(0, 8)}`;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        displayName: 'Guest User',
        photoURL: 'https://randomuser.me/api/portraits/lego/1.jpg',
        bio: '',
        followers: 0,
        following: 0,
        isVerified: false,
        isAnonymous: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error logging in anonymously:', error);
      throw error;
    }
  },
  
  // تسجيل الخروج
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
};

// User Services
export const userService = {
  // الحصول على بيانات المستخدم
  async getUserData(userId: string): Promise<FirebaseUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data() as FirebaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },
  
  // الحصول على بيانات المستخدم باسم المستخدم
  async getUserByUsername(username: string): Promise<FirebaseUser | null> {
    try {
      const usersQuery = query(collection(db, 'users'), where('username', '==', username), limitQuery(1));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },
  
  // تحديث بيانات المستخدم
  async updateUserProfile(userId: string, data: Partial<FirebaseUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // تحديث الملف الشخصي في Firebase Auth إذا كان المستخدم مسجلاً
      if (auth.currentUser && (data.displayName || data.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  // متابعة مستخدم
  async followUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
      // إضافة إلى مجموعة المتابعات
      await setDoc(doc(db, 'follows', `${currentUserId}_${targetUserId}`), {
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: serverTimestamp()
      });
      
      // تحديث عدد المتابعين والمتابَعين
      await updateDoc(doc(db, 'users', currentUserId), {
        following: increment(1),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },
  
  // إلغاء متابعة مستخدم
  async unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
      // حذف من مجموعة المتابعات
      await deleteDoc(doc(db, 'follows', `${currentUserId}_${targetUserId}`));
      
      // تحديث عدد المتابعين والمتابَعين
      await updateDoc(doc(db, 'users', currentUserId), {
        following: increment(-1),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },
  
  // التحقق مما إذا كان المستخدم يتابع مستخدمًا آخر
  async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const followDoc = await getDoc(doc(db, 'follows', `${currentUserId}_${targetUserId}`));
      return followDoc.exists();
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  },
  
  // الحصول على قائمة المتابعين
  async getFollowers(userId: string, limitVal = 10): Promise<FirebaseUser[]> {
    try {
      const followsQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(followsQuery);
      const followers: FirebaseUser[] = [];
      
      for (const doc of querySnapshot.docs) {
        const followData = doc.data();
        const userData = await this.getUserData(followData.followerId);
        
        if (userData) {
          followers.push(userData);
        }
      }
      
      return followers;
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  },
  
  // الحصول على قائمة المتابَعين
  async getFollowing(userId: string, limitVal = 10): Promise<FirebaseUser[]> {
    try {
      const followsQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(followsQuery);
      const following: FirebaseUser[] = [];
      
      for (const doc of querySnapshot.docs) {
        const followData = doc.data();
        const userData = await this.getUserData(followData.followingId);
        
        if (userData) {
          following.push(userData);
        }
      }
      
      return following;
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }
};

// Video Services
export const videoService = {
  // تحميل فيديو جديد
  async uploadVideo(
    file: File,
    thumbnailFile: File | null,
    userId: string,
    username: string,
    userImage: string,
    caption: string,
    tags: string[],
    audioTitle?: string
  ): Promise<string> {
    try {
      // إنشاء معرف فريد للفيديو
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // تحميل ملف الفيديو إلى Storage
      const videoRef = ref(storage, `videos/${userId}/${videoId}`);
      const videoUploadTask = uploadBytesResumable(videoRef, file);
      
      // انتظار اكتمال التحميل
      await new Promise<void>((resolve, reject) => {
        videoUploadTask.on(
          'state_changed',
          (snapshot) => {
            // يمكن إضافة تقدم التحميل هنا
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
            reject(error);
          },
          () => {
            resolve();
          }
        );
      });
      
      // الحصول على رابط الفيديو
      const videoUrl = await getDownloadURL(videoRef);
      
      // تحميل الصورة المصغرة إذا كانت موجودة
      let thumbnailUrl = '';
      
      if (thumbnailFile) {
        const thumbnailRef = ref(storage, `thumbnails/${userId}/${videoId}`);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);
        
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
        
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }
      
      // إنشاء وثيقة الفيديو في Firestore
      const videoData: FirebaseVideo = {
        userId,
        username,
        userImage,
        caption,
        videoUrl,
        thumbnailUrl,
        audioTitle: audioTitle || 'Original Sound',
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        tags,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      const videoDocRef = doc(db, 'videos', videoId);
      await setDoc(videoDocRef, videoData);
      
      return videoId;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },
  
  // الحصول على فيديو بواسطة المعرف
  async getVideoById(videoId: string): Promise<FirebaseVideo | null> {
    try {
      const videoDoc = await getDoc(doc(db, 'videos', videoId));
      
      if (videoDoc.exists()) {
        const videoData = videoDoc.data() as FirebaseVideo;
        return { ...videoData, id: videoDoc.id };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting video by ID:', error);
      throw error;
    }
  },
  
  // الحصول على قائمة الفيديوهات
  async getVideos(limitVal = 10): Promise<FirebaseVideo[]> {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(videosQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseVideo,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting videos:', error);
      throw error;
    }
  },
  
  // الحصول على فيديوهات مستخدم معين
  async getUserVideos(userId: string, limitVal = 10): Promise<FirebaseVideo[]> {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(videosQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseVideo,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting user videos:', error);
      throw error;
    }
  },
  
  // البحث عن فيديوهات بواسطة الوسوم
  async searchVideosByTags(tag: string, limitVal = 10): Promise<FirebaseVideo[]> {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('tags', 'array-contains', tag),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(videosQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseVideo,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error searching videos by tags:', error);
      throw error;
    }
  },
  
  // الإعجاب بفيديو
  async likeVideo(userId: string, videoId: string): Promise<void> {
    try {
      // إضافة إلى مجموعة الإعجابات
      await setDoc(doc(db, 'likes', `${userId}_${videoId}`), {
        userId,
        videoId,
        createdAt: serverTimestamp()
      });
      
      // تحديث عدد الإعجابات في الفيديو
      await updateDoc(doc(db, 'videos', videoId), {
        likes: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  },
  
  // إلغاء الإعجاب بفيديو
  async unlikeVideo(userId: string, videoId: string): Promise<void> {
    try {
      // حذف من مجموعة الإعجابات
      await deleteDoc(doc(db, 'likes', `${userId}_${videoId}`));
      
      // تحديث عدد الإعجابات في الفيديو
      await updateDoc(doc(db, 'videos', videoId), {
        likes: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unliking video:', error);
      throw error;
    }
  },
  
  // التحقق مما إذا كان المستخدم معجبًا بفيديو
  async isVideoLiked(userId: string, videoId: string): Promise<boolean> {
    try {
      const likeDoc = await getDoc(doc(db, 'likes', `${userId}_${videoId}`));
      return likeDoc.exists();
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  },
  
  // زيادة عدد المشاهدات
  async incrementViews(videoId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'videos', videoId), {
        views: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  },
  
  // حذف فيديو
  async deleteVideo(videoId: string, userId: string): Promise<void> {
    try {
      // التحقق من أن المستخدم هو مالك الفيديو
      const videoDoc = await getDoc(doc(db, 'videos', videoId));
      
      if (!videoDoc.exists()) {
        throw new Error('Video not found');
      }
      
      const videoData = videoDoc.data() as FirebaseVideo;
      
      if (videoData.userId !== userId) {
        throw new Error('Unauthorized to delete this video');
      }
      
      // حذف ملف الفيديو من Storage
      const videoRef = ref(storage, `videos/${userId}/${videoId}`);
      await deleteObject(videoRef);
      
      // حذف الصورة المصغرة إذا كانت موجودة
      if (videoData.thumbnailUrl) {
        const thumbnailRef = ref(storage, `thumbnails/${userId}/${videoId}`);
        await deleteObject(thumbnailRef);
      }
      
      // حذف التعليقات المرتبطة بالفيديو
      const commentsQuery = query(collection(db, 'comments'), where('videoId', '==', videoId));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const deleteCommentPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteCommentPromises);
      
      // حذف الإعجابات المرتبطة بالفيديو
      const likesQuery = query(collection(db, 'likes'), where('videoId', '==', videoId));
      const likesSnapshot = await getDocs(likesQuery);
      
      const deleteLikePromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteLikePromises);
      
      // حذف وثيقة الفيديو من Firestore
      await deleteDoc(doc(db, 'videos', videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};

// Comment Services
export const commentService = {
  // إضافة تعليق جديد
  async addComment(
    videoId: string,
    userId: string,
    username: string,
    userImage: string,
    text: string,
    parentId?: string
  ): Promise<string> {
    try {
      // إنشاء وثيقة التعليق في Firestore
      const commentData: FirebaseComment = {
        videoId,
        userId,
        username,
        userImage,
        text,
        likes: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      if (parentId) {
        commentData.parentId = parentId;
      }
      
      const commentRef = await addDoc(collection(db, 'comments'), commentData);
      
      // تحديث عدد التعليقات في الفيديو
      await updateDoc(doc(db, 'videos', videoId), {
        comments: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return commentRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  // الحصول على تعليقات فيديو
  async getVideoComments(videoId: string, limitVal = 20): Promise<FirebaseComment[]> {
    try {
      // الحصول على التعليقات الرئيسية فقط (ليست ردودًا)
      const commentsQuery = query(
        collection(db, 'comments'),
        where('videoId', '==', videoId),
        where('parentId', '==', null),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseComment,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting video comments:', error);
      throw error;
    }
  },
  
  // الحصول على الردود على تعليق
  async getCommentReplies(commentId: string, limitVal = 10): Promise<FirebaseComment[]> {
    try {
      const repliesQuery = query(
        collection(db, 'comments'),
        where('parentId', '==', commentId),
        orderBy('createdAt', 'asc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(repliesQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseComment,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  },
  
  // الإعجاب بتعليق
  async likeComment(userId: string, commentId: string): Promise<void> {
    try {
      // إضافة إلى مجموعة الإعجابات بالتعليقات
      await setDoc(doc(db, 'commentLikes', `${userId}_${commentId}`), {
        userId,
        commentId,
        createdAt: serverTimestamp()
      });
      
      // تحديث عدد الإعجابات في التعليق
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },
  
  // إلغاء الإعجاب بتعليق
  async unlikeComment(userId: string, commentId: string): Promise<void> {
    try {
      // حذف من مجموعة الإعجابات بالتعليقات
      await deleteDoc(doc(db, 'commentLikes', `${userId}_${commentId}`));
      
      // تحديث عدد الإعجابات في التعليق
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  },
  
  // التحقق مما إذا كان المستخدم معجبًا بتعليق
  async isCommentLiked(userId: string, commentId: string): Promise<boolean> {
    try {
      const likeDoc = await getDoc(doc(db, 'commentLikes', `${userId}_${commentId}`));
      return likeDoc.exists();
    } catch (error) {
      console.error('Error checking comment like status:', error);
      throw error;
    }
  },
  
  // حذف تعليق
  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      // التحقق من أن المستخدم هو مالك التعليق
      const commentDoc = await getDoc(doc(db, 'comments', commentId));
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      const commentData = commentDoc.data() as FirebaseComment;
      
      if (commentData.userId !== userId) {
        throw new Error('Unauthorized to delete this comment');
      }
      
      // حذف الردود على التعليق
      const repliesQuery = query(collection(db, 'comments'), where('parentId', '==', commentId));
      const repliesSnapshot = await getDocs(repliesQuery);
      
      const deleteReplyPromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteReplyPromises);
      
      // حذف الإعجابات بالتعليق
      const likesQuery = query(collection(db, 'commentLikes'), where('commentId', '==', commentId));
      const likesSnapshot = await getDocs(likesQuery);
      
      const deleteLikePromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteLikePromises);
      
      // حذف وثيقة التعليق من Firestore
      await deleteDoc(doc(db, 'comments', commentId));
      
      // تحديث عدد التعليقات في الفيديو
      await updateDoc(doc(db, 'videos', commentData.videoId), {
        comments: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// Notification Services
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system';

export type FirebaseNotification = {
  id?: string;
  recipientId: string;
  senderId?: string;
  senderUsername?: string;
  senderImage?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  videoId?: string;
  commentId?: string;
  createdAt?: Timestamp;
};

export const notificationService = {
  // إضافة إشعار جديد
  async addNotification(notification: Omit<FirebaseNotification, 'id' | 'read' | 'createdAt'>): Promise<string> {
    try {
      const notificationData: FirebaseNotification = {
        ...notification,
        read: false,
        createdAt: serverTimestamp() as Timestamp
      };
      
      const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
      return notificationRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },
  
  // الحصول على إشعارات المستخدم
  async getUserNotifications(userId: string, limitVal = 20): Promise<FirebaseNotification[]> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitQuery(limitVal)
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data() as FirebaseNotification,
        id: doc.id
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },
  
  // تحديث حالة قراءة الإشعار
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // تحديث جميع إشعارات المستخدم كمقروءة
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // حذف إشعار
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};