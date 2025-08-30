import { apiClient } from './api';

export interface Profile {
  _id?: string;
  userId?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  profession?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
  profilePicture?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export class ProfileService {
  // Get current user's profile
  static async getMyProfile(): Promise<ApiResponse<Profile>> {
    return apiClient.get('/api/profile/me');
  }

  // Get profile by user ID
  static async getProfileByUserId(userId: string): Promise<ApiResponse<Profile>> {
    // Backend route is GET /api/profile/:userId
    return apiClient.get(`/api/profile/${userId}`);
  }

  // Create or update current user's profile
  static async upsertMyProfile(profileData: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return apiClient.put('/api/profile/me', profileData);
  }

  // Update profile picture
  static async updateProfilePicture(imageFile: File): Promise<ApiResponse<Profile>> {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);
    
    return apiClient.post('/api/profile/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete current user's profile
  static async deleteMyProfile(): Promise<ApiResponse<void>> {
    return apiClient.delete('/api/profile/me');
  }

  // Get public profiles (for discovery/search)
  static async getPublicProfiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ profiles: Profile[]; total: number; page: number; pages: number }>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get(`/api/profile/public${queryString ? `?${queryString}` : ''}`);
  }
}