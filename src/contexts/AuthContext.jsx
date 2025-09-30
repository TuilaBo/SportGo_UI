import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getUserInfo } from '../services/authService';
import { generateUserAvatar } from '../utils/avatarGenerator';

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

  const login = useCallback(async (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
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
        
        // Redirect based on user role after login
        if (userInfo.role === 'Provider' && !userInfo.hasBusinessInfo) {
          // Provider without business info, redirect to business registration
          setTimeout(() => {
            window.location.href = '/provider-profile';
          }, 500);
        } else if (userInfo.role === 'Provider' && userInfo.hasBusinessInfo) {
          // Provider with business info, redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          // Regular user, redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Keep the original userData if API call fails
      }
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const checkAuth = useCallback(async () => {
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
      } catch (error) {
        console.error('Failed to fetch user info on checkAuth:', error);
        // Keep the existing userData if API call fails
      }
    }
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    user,
    login,
    logout,
    checkAuth
  }), [isLoggedIn, user, login, logout, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
