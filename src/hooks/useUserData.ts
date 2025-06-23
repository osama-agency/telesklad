import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export function useUserData() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/get-user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [session]);

  return {
    userData,
    loading,
    refetch: async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user/get-user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error refetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
  };
} 