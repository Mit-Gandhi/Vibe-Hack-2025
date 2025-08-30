import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { ProfileService } from '@/lib/profile';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    otp: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        setOtpSent(true);
        toast({
          title: "Registration Successful",
          description: response.message || "OTP sent to your email. Please verify to complete registration.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.verifyOtp({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });

      if (response.success) {
        // After successful verification, user is automatically logged in
        toast({
          title: "Welcome!",
          description: "Account created and logged in successfully!",
        });
        
        // Check if there's a redirect path stored
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
          return;
        }
        
        // Redirect to profile setup for new users
        navigate('/profile/setup');
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login({ email: formData.email, password: formData.password });
      
      if (response.success && response.user) {
        // persist token then immediately refresh user in context so Header shows authenticated UI without reload
        await refreshUser();
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Check if there's a redirect path stored
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
          return;
        }

        // Redirect based on user role
        if (response.user.role === 'admin') {
          navigate('/dashboard');
        } else {
          // Check if user has completed profile
          try {
            const profileResponse = await ProfileService.getMyProfile();
            if (profileResponse.success && profileResponse.data) {
              navigate('/profile');
            } else {
              navigate('/profile/setup');
            }
          } catch {
            navigate('/profile/setup');
          }
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await AuthService.resendOtp(
        formData.email,
        formData.name,
        formData.username,
        formData.password
      );
      if (response.success) {
        toast({
          title: "OTP Resent",
          description: response.message || "New OTP sent to your email.",
        });
      } else {
        toast({
          title: "Failed to Resend OTP",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      otp: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Sign In' : otpSent ? 'Verify OTP' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleSignin : otpSent ? handleSignupVerify : handleSignupRequest}>
            <div className="space-y-4">
              {!isLogin && !otpSent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              
              {!otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {!otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      OTP sent to {formData.email}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="p-0 h-auto text-xs"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>

              {otpSent && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setOtpSent(false)}
                >
                  Back to Sign Up
                </Button>
              )}

              {!otpSent && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={switchMode}
                    className="text-sm"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;