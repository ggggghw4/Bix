'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Extended user type to support mock guest users
type ExtendedUser = User | {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
};

type AuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  isGuest: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  logout: async () => { console.log('Logout not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // If using Firebase auth
      if (!isGuest) {
        try {
          await auth.signOut();
        } catch (error) {
          console.error("Firebase signOut error:", error);
        }
      }
      
      // For guest users or as a fallback
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('bix-guest-user');
        } catch (error) {
          console.error("Error removing guest user from localStorage:", error);
        }
      }
      
      // Reset state
      setUser(null);
      setIsGuest(false);
      
      // Redirect will be handled by the component that calls this function
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    // وضع علامة لتتبع ما إذا كان المكون لا يزال مثبتًا
    let isMounted = true;
    
    // تعيين مهلة زمنية لإنهاء حالة التحميل بعد 3 ثوانٍ كحد أقصى
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log("Auth timeout reached, creating guest user");
        createMockGuestUser();
      }
    }, 3000);
    
    // Function to safely access localStorage (only in browser)
    const safeLocalStorage = {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          try {
            return localStorage.getItem(key);
          } catch (e) {
            console.error('Error accessing localStorage:', e);
            return null;
          }
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (e) {
            console.error('Error setting localStorage:', e);
            return false;
          }
        }
        return false;
      }
    };

    // Function to check for mock guest user in localStorage
    const checkForMockGuestUser = () => {
      const mockGuestUser = safeLocalStorage.getItem('bix-guest-user');
      if (mockGuestUser) {
        console.log("Found mock guest user in localStorage");
        try {
          const parsedUser = JSON.parse(mockGuestUser);
          if (isMounted) {
            setUser(parsedUser);
            setIsGuest(true);
            setLoading(false);
          }
          return true;
        } catch (e) {
          console.error('Error parsing guest user:', e);
        }
      }
      return false;
    };

    // Function to create a mock guest user
    const createMockGuestUser = () => {
      try {
        const randomId = Math.random().toString(36).substring(2, 9);
        const guestUser = {
          uid: `guest-${Date.now()}-${randomId}`,
          isAnonymous: true,
          displayName: "مستخدم ضيف",
          photoURL: "https://randomuser.me/api/portraits/lego/1.jpg",
          email: null
        };
        
        const success = safeLocalStorage.setItem('bix-guest-user', JSON.stringify(guestUser));
        if (success) {
          console.log("Created new mock guest user:", guestUser.uid);
        } else {
          console.log("Created guest user in memory only (localStorage failed)");
        }
        
        if (isMounted) {
          setUser(guestUser);
          setIsGuest(true);
          setLoading(false);
        }
        return true;
      } catch (error) {
        console.error("Error creating guest user:", error);
        // إنشاء مستخدم ضيف بسيط في حالة حدوث خطأ
        if (isMounted) {
          const fallbackUser = { 
            uid: `guest-fallback`, 
            isAnonymous: true, 
            displayName: "ضيف",
            photoURL: null,
            email: null
          };
          setUser(fallbackUser);
          setIsGuest(true);
          setLoading(false);
        }
        return true;
      }
    };

    // Initial check for mock guest user
    const hasMockUser = checkForMockGuestUser();

    // If no mock guest user, listen for Firebase auth changes
    let unsubscribe: () => void = () => {};
    if (!hasMockUser) {
      try {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!isMounted) return;
          
          if (firebaseUser) {
            console.log("Firebase auth user:", firebaseUser.uid, "isAnonymous:", firebaseUser.isAnonymous);
            setUser(firebaseUser);
            setIsGuest(firebaseUser.isAnonymous);
            setLoading(false);
          } else {
            // No Firebase user, create a mock guest user automatically
            createMockGuestUser();
          }
        }, (error) => {
          console.error("Firebase auth error:", error);
          if (isMounted) {
            // في حالة حدوث خطأ في المصادقة، قم بإنشاء مستخدم ضيف
            createMockGuestUser();
          }
        });
      } catch (error) {
        console.error("Error setting up auth state listener:", error);
        if (isMounted) {
          createMockGuestUser();
        }
      }
    }

    // Clean up function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}