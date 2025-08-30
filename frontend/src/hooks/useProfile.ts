import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService, ProfileUpdateData } from '@/lib/profile';

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await ProfileService.getMyProfile();
      return response.profile;
    },
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (profile not found)
      if (error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useProfileByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await ProfileService.getProfileByUserId(userId);
      return response.profile;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: ProfileUpdateData) => 
      ProfileService.upsertMyProfile(profileData),
    onSuccess: (response) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['profile', 'me'], response.profile);
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};