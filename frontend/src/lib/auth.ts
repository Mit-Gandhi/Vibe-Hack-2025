import { apiClient, ApiResponse } from './api';

export interface User {
  _id: string;
  email: string;
  username: string;
  name?: string; // display name
  role?: 'user' | 'admin' | string; // backend-provided role
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpData {
  name: string;
  username: string;
  email: string;
  password: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export class AuthService {
  // Register new user (request signup)
  static async register(credentials: RegisterCredentials): Promise<ApiResponse<User>> {
    return apiClient.post('/api/auth/signup/request', credentials);
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/api/auth/login', credentials);
    
    // Store token in localStorage if login successful
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  // Verify OTP and complete signup
  static async verifyOtp(data: VerifyOtpData): Promise<ApiResponse> {
    const response = await apiClient.post('/api/auth/signup/verify', data);
    
    // Store token if verification includes login
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  // Resend OTP (reuse the signup request endpoint)
  static async resendOtp(email: string, name: string, username: string, password: string): Promise<ApiResponse> {
    return apiClient.post('/api/auth/signup/request', { name, username, email, password });
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    return apiClient.post('/api/auth/forgot-password', data);
  }

  // Reset password
  static async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    return apiClient.post('/api/auth/reset-password', data);
  }

  // Get current user profile
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/api/auth/profile');
  }

  // Logout
  static logout(): void {
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}