import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    let token;
    try {
      token = await AsyncStorage.getItem('userToken');
    } catch (e) {
      console.error('Restoring token failed');
    }
    setUserToken(token);
    setIsLoading(false);
  };

  const authContext = {
    signIn: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
        return { success: true };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Login failed' };
      }
    },
    signUp: async (name, email, password) => {
      try {
        const response = await api.post('/auth/register', { name, email, password });
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
        return { success: true };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' };
      }
    },
    signOut: async () => {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    },
    userToken,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
