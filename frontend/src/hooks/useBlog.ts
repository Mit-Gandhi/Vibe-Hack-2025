import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogService, BlogCreateData, BlogUpdateData, BlogQueryParams } from '@/lib/blog';

export const useBlogs = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: async () => {
      const response = await BlogService.getBlogs(params);
      return response.data;
    },
  });
};

export const useBlogBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const response = await BlogService.getBlogBySlug(slug);
      return response.blog;
    },
    enabled: !!slug,
  });
};

export const useMyBlogs = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ['blogs', 'my', params],
    queryFn: async () => {
      const response = await BlogService.getMyBlogs(params);
      return response.data;
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogData: BlogCreateData) => BlogService.createBlog(blogData),
    onSuccess: () => {
      // Invalidate and refetch blogs
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Blog creation failed:', error);
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ blogId, blogData }: { blogId: string; blogData: BlogUpdateData }) => 
      BlogService.updateBlog(blogId, blogData),
    onSuccess: (response, variables) => {
      // Update the specific blog in cache
      queryClient.setQueryData(['blog', response.blog?.slug], response.blog);
      // Invalidate blogs list
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Blog update failed:', error);
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogId: string) => BlogService.deleteBlog(blogId),
    onSuccess: () => {
      // Invalidate blogs list
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Blog deletion failed:', error);
    },
  });
};

export const usePublishBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogId: string) => BlogService.publishBlog(blogId),
    onSuccess: (response) => {
      // Update the specific blog in cache
      queryClient.setQueryData(['blog', response.blog?.slug], response.blog);
      // Invalidate blogs list
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Blog publish failed:', error);
    },
  });
};

export const useUnpublishBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogId: string) => BlogService.unpublishBlog(blogId),
    onSuccess: (response) => {
      // Update the specific blog in cache
      queryClient.setQueryData(['blog', response.blog?.slug], response.blog);
      // Invalidate blogs list
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Blog unpublish failed:', error);
    },
  });
};