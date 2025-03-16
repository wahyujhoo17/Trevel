'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, getRedirectResult } from 'firebase/auth';

export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const auth = getAuth();
        const result = await getRedirectResult(auth);
        if (result) {
          // Authentication successful
          router.push('/'); // Redirect to home page
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        router.push('/'); // Redirect to home page on error
      }
    };

    handleRedirect();
  }, [router]);

  return <div>Processing authentication...</div>;
}