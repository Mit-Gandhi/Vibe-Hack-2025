import { apiClient, ApiResponse } from './api';

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  author: string;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime?: number;
  views?: number;
}

export interface BlogCreateData {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published';
}

export interface BlogUpdateData extends Partial<BlogCreateData> {}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  author?: string;
  tags?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface BlogComment {
  _id: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  parentCommentId?: string | null;
  user?: { name?: string; username?: string };
}

export class BlogService {
  // Get all blogs (public)
  static async getBlogs(params?: BlogQueryParams): Promise<ApiResponse<{ blogs: Blog[]; total: number; page: number; totalPages: number }>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return apiClient.get(`/api/blogs${queryString ? `?${queryString}` : ''}`);
  }

  // Get single blog by slug (public)
  static async getBlogBySlug(slug: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/blogs/${slug}`);
  }

  static async getBlogById(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/blogs/${id}`);
  }

  // Get current user's blogs
  static async getMyBlogs(): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/blogs/mine/all`);
  }

  // Create new blog
  static async createBlog(blogData: BlogCreateData): Promise<ApiResponse<Blog>> {
    // Backend expects status 'draft' | 'published'; visibility moderation handled server-side
    return apiClient.post('/api/blogs', blogData);
  }

  // Update blog
  static async updateBlog(blogId: string, blogData: BlogUpdateData): Promise<ApiResponse<Blog>> {
    return apiClient.put(`/api/blogs/${blogId}`, blogData);
  }

  // Delete blog
  static async deleteBlog(blogId: string): Promise<ApiResponse> {
    return apiClient.delete(`/api/blogs/${blogId}`);
  }

  // Like toggle for a blog (returns { likes, liked })
  static async toggleLike(blogId: string): Promise<ApiResponse<{ likes: number; liked: boolean }>> {
    return apiClient.post(`/api/blogs/${blogId}/like`);
  }

  // Comments
  static async listComments(blogId: string): Promise<ApiResponse<{ comments: BlogComment[] }>> {
    const id = String(blogId); // ensure path param is a string
    return apiClient.get(`/api/comments/${id}`);
  }

  static async addComment(blogId: string, content: string): Promise<ApiResponse<{ comment: BlogComment }>> {
    const id = String(blogId); // ensure path param is a string
    return apiClient.post(`/api/comments/${id}`, { content });
  }

  // Suggestions (public)
  static async suggest(query: string): Promise<ApiResponse<{ suggestions: { title: string; slug: string }[] }>> {
    const qs = new URLSearchParams({ q: query }).toString();
    return apiClient.get(`/api/blogs/suggest?${qs}`);
  }

  // Admin Methods
  
  // Get blogs for moderation (admin only)
  static async getBlogsForModeration(): Promise<ApiResponse<{ blogs: Blog[] }>> {
    return apiClient.get('/api/blogs/moderation/list');
  }

  // Update blog visibility (admin only)
  static async updateBlogVisibility(blogId: string, visibility: 'pending' | 'approved' | 'rejected' | 'hidden'): Promise<ApiResponse<Blog>> {
    return apiClient.patch(`/api/blogs/${blogId}/visibility`, { visibility });
  }

  // Get all blogs including drafts and pending (admin only)
  static async getAllBlogsAdmin(): Promise<ApiResponse<{ blogs: Blog[] }>> {
    return apiClient.get('/api/blogs/moderation/list');
  }
}