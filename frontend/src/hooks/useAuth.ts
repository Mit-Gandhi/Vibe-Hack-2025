import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService, LoginCredentials, RegisterCredentials, VerifyOtpData } from '@/lib/auth';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useLogin = () => {
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) => login(email, password),
    onSuccess: () => {
      // Redirect or show success message
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useRegister = () => {
  const { register } = useAuthContext();
  
  return useMutation({
    mutationFn: ({ username, email, password }: RegisterCredentials) => 
      register(username, email, password),
    onSuccess: () => {
      // Show success message or redirect to OTP verification
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpData) => AuthService.verifyOtp(data),
    onSuccess: () => {
      // Show success message or redirect to login
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.resendOtp(email),
    onSuccess: () => {
      // Show success message
    },
    onError: (error) => {
      console.error('Resend OTP failed:', error);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword({ email }),
    onSuccess: () => {
      // Show success message
    },
    onError: (error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) => 
      AuthService.resetPassword(data),
    onSuccess: () => {
      // Show success message or redirect to login
    },
    onError: (error) => {
      console.error('Reset password failed:', error);
    },
  });
};