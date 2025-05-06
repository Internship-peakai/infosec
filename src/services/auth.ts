import { useEffect } from 'react';
import { useAccessToken, useAuthenticationStatus } from '@nhost/react';

const TOKEN_KEY = 'infosec_jwt_token';

export const useAuthToken = () => {
  const accessToken = useAccessToken();
  const { isAuthenticated } = useAuthenticationStatus();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [isAuthenticated, accessToken]);

  const getStoredToken = (): string | null => {
    if (!isAuthenticated) {
      return null;
    }
    return accessToken || localStorage.getItem(TOKEN_KEY) || null;
  };

  return { getStoredToken };
};