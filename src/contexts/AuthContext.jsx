import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useEffect } from 'react';
import { getUserInfo, logoutUser } from '../services/authService';
import { generateUserAvatar } from '../utils/avatarGenerator';
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [refreshTokenInterval, setRefreshTokenInterval] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const login = useCallback(async (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.accessToken) localStorage.setItem('accessToken', userData.accessToken);
    if (userData.refreshToken) localStorage.setItem('refreshToken', userData.refreshToken);
    
    // Start refresh token interval - call it directly to avoid dependency issues
    if (refreshTokenInterval) {
      clearInterval(refreshTokenInterval);
    }
    
    // Refresh token every 10 minutes (600000ms)
    const interval = setInterval(async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          logout();
          return;
        }

        const res = await fetch(getApiUrl('Auth/refresh-token'), {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: storedRefreshToken
          })
        });

        if (!res.ok) {
          logout();
          return;
        }

        const data = await res.json();
        
        // Update tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Update user state
        setUser(prev => ({
          ...prev,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        }));
        
      } catch (e) {
        console.error('Refresh token failed:', e);
        logout();
      }
    }, 600000);
    
    setRefreshTokenInterval(interval);
    
    // Fetch complete user info from API
    if (userData.accessToken) {
      try {
        const userInfo = await getUserInfo(userData.accessToken);
        const completeUserData = {
          ...userData,
          userId: userInfo.userId,
          fullName: userInfo.fullName,
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          role: userInfo.role,
          createdAt: userInfo.createdAt,
          currentPackage: userInfo.currentPackage,
          avatar: generateUserAvatar(userInfo.fullName, userInfo.email),
          isProvider: userInfo.role === 'Provider',
          hasBusinessInfo: userInfo.hasBusinessInfo || false
        };
        setUser(completeUserData);
        localStorage.setItem('user', JSON.stringify(completeUserData));
        if (completeUserData.accessToken) localStorage.setItem('accessToken', completeUserData.accessToken);
        if (completeUserData.refreshToken) localStorage.setItem('refreshToken', completeUserData.refreshToken);
        
        // Don't redirect here - let the calling component handle navigation
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Keep the original userData if API call fails
      }
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        logout();
        return;
      }

      const res = await fetch(getApiUrl('Auth/refresh-token'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: storedRefreshToken
        })
      });

      if (!res.ok) {
        logout();
        return;
      }

      const data = await res.json();
      
      // Update tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Update user state
      setUser(prev => ({
        ...prev,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      }));
      
    } catch (e) {
      console.error('Refresh token failed:', e);
      logout();
    }
  }, []);

  // Start refresh token interval
  const startRefreshTokenInterval = useCallback(() => {
    // Clear existing interval
    if (refreshTokenInterval) {
      clearInterval(refreshTokenInterval);
    }
    
    // Refresh token every 10 minutes (600000ms)
    const interval = setInterval(() => {
      refreshToken();
    }, 600000);
    
    setRefreshTokenInterval(interval);
  }, [refreshToken, refreshTokenInterval]);

  // Stop refresh token interval
  const stopRefreshTokenInterval = useCallback(() => {
    if (refreshTokenInterval) {
      clearInterval(refreshTokenInterval);
      setRefreshTokenInterval(null);
    }
  }, [refreshTokenInterval]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    const refreshToken = localStorage.getItem('refreshToken') || (user && user.refreshToken);
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (e) {
      // Surface failure in console; still clear client state per UX simplicity
      console.error('Backend logout failed:', e);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Stop refresh token interval directly
      if (refreshTokenInterval) {
        clearInterval(refreshTokenInterval);
        setRefreshTokenInterval(null);
      }
      
      setIsLoggingOut(false);
      // Don't redirect here - let components handle navigation
    }
  }, [user, refreshTokenInterval]);

  const checkAuth = useCallback(async () => {
    if (isLoggingOut) {
      setIsAuthLoading(false);
      return;
    }
    
    setIsAuthLoading(true);
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (savedUser && accessToken) {
      const userData = JSON.parse(savedUser);
      // Add tokens to user data if not already present
      if (!userData.accessToken) {
        userData.accessToken = accessToken;
        userData.refreshToken = refreshToken;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setUser(userData);
      setIsLoggedIn(true);
      
      // Fetch fresh user info from API
      try {
        const userInfo = await getUserInfo(accessToken);
        const completeUserData = {
          ...userData,
          userId: userInfo.userId,
          fullName: userInfo.fullName,
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          role: userInfo.role,
          createdAt: userInfo.createdAt,
          currentPackage: userInfo.currentPackage,
          avatar: generateUserAvatar(userInfo.fullName, userInfo.email),
          isProvider: userInfo.role === 'Provider'
        };
        setUser(completeUserData);
        localStorage.setItem('user', JSON.stringify(completeUserData));
        
        // Start refresh token interval - call it directly to avoid dependency issues
        if (refreshTokenInterval) {
          clearInterval(refreshTokenInterval);
        }
        
        // Refresh token every 10 minutes (600000ms)
        const interval = setInterval(async () => {
          try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
              logout();
              return;
            }

            const res = await fetch(getApiUrl('Auth/refresh-token'), {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                refreshToken: storedRefreshToken
              })
            });

            if (!res.ok) {
              logout();
              return;
            }

            const data = await res.json();
            
            // Update tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            // Update user state
            setUser(prev => ({
              ...prev,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken
            }));
            
          } catch (e) {
            console.error('Refresh token failed:', e);
            logout();
          }
        }, 600000);
        
        setRefreshTokenInterval(interval);
      } catch (error) {
        console.error('Failed to fetch user info on checkAuth:', error);
        // Keep the existing userData if API call fails
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsAuthLoading(false);
  }, [isLoggingOut]);

  const value = useMemo(() => ({
    isLoggedIn,
    user,
    isAuthLoading,
    login,
    logout,
    checkAuth
  }), [isLoggedIn, user, isAuthLoading, login, logout, checkAuth]);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
