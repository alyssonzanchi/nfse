import Cookies from 'js-cookie';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthProps {
  children: ReactNode;
}

export function Auth({ children }: AuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authToken = Cookies.get('AUTH_TOKEN');
      if (authToken) {
        try {
          const isValid = await validateToken(authToken);
          setIsAuthenticated(isValid);
        } catch (error) {
          console.error('Error validating token:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/check-token`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.valid;
    } catch (error) {
      throw new Error('Failed to validate token');
    }
  };

  if (isLoading) {
    return;
  }

  if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
