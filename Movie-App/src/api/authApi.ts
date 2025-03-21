import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    id: number; 
    username: string;
  };
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(getApiUrl('/auth/login/'), data);
    console.log('Login response:', response.data);
    const { token, user } = response.data;
    
    if (token && user) {
      await AsyncStorage.setItem('userToken', token);
      console.log('Auth data saved:', { token, user });
      return response.data;
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(getApiUrl('/auth/register/'), data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    // Optional: Call backend logout endpoint if needed
    // await axios.post(getApiUrl('/auth/logout/'));
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    return false;
  }
};
