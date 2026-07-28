import { Post, CategoryType, SortType, CreatePostPayload, CreateCommentPayload } from '../types';
import { BACKEND_API_URL } from '../config';

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem('XINMIN_API_URL');
  if (custom && custom.trim() !== '' && custom.trim() !== '/api') {
    return custom.trim().replace(/\/$/, '');
  }
  return BACKEND_API_URL;
}

export function setApiBaseUrl(url: string) {
  if (!url || !url.trim()) {
    localStorage.removeItem('XINMIN_API_URL');
  } else {
    localStorage.setItem('XINMIN_API_URL', url.trim().replace(/\/$/, ''));
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(fullUrl, { ...options, headers });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 403 && errData.error === 'banned') {
        const err = new Error(errData.message || '您已被停權');
        (err as any).isBanError = true;
        (err as any).banDetails = errData;
        throw err;
      }
      throw new Error(errData.error || `HTTP ${response.status}: 請求失敗`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`API Error on ${fullUrl}:`, error);
    throw error;
  }
}

export const api = {
  async getHealth() {
    return request<{ status: string; service: string; totalPosts: number; timestamp: string }>('/health');
  },

  async getStats() {
    return request<{ totalPosts: number; totalComments: number; totalReactions: number; activeUserCount: number }>('/stats');
  },

  async getPosts(category: CategoryType = '全部', sort: SortType = 'latest', search: string = ''): Promise<Post[]> {
    const params = new URLSearchParams();
    if (category && category !== '全部') params.append('category', category);
    if (sort) params.append('sort', sort);
    if (search && search.trim()) params.append('search', search.trim());

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<Post[]>(`/posts${queryStr}`);
  },

  async getPostById(id: string): Promise<Post> {
    return request<Post>(`/posts/${id}`);
  },

  async createPost(payload: CreatePostPayload): Promise<Post> {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async reactToPost(id: string, reactionType: 'like' | 'heart' | 'laugh' | 'sad' | 'angry'): Promise<{ id: string; reactions: Post['reactions'] }> {
    return request<{ id: string; reactions: Post['reactions'] }>(`/posts/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  },

  async createComment(postId: string, payload: CreateCommentPayload) {
    return request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async likeComment(postId: string, commentId: string) {
    return request(`/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  async votePoll(postId: string, optionId: string) {
    return request(`/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  },

  async reportPost(postId: string) {
    return request<{ message: string; reportsCount: number }>(`/posts/${postId}/report`, {
      method: 'POST',
    });
  },

  async adminVerifySecret(secret: string) {
    return request<{ success: boolean; posts: Post[]; bans: any[] }>('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ secret }),
    });
  },

  async adminBan(payload: { ip: string; reason: string; durationMinutes: number | string; deletePostIds?: string[] }, adminSecret: string) {
    return request<{ success: boolean; message: string; bans: any[]; posts: Post[] }>('/admin/ban', {
      method: 'POST',
      headers: {
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify(payload),
    });
  },

  async adminUnban(ip: string, adminSecret: string) {
    return request<{ success: boolean; message: string; bans: any[] }>('/admin/unban', {
      method: 'POST',
      headers: {
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify({ ip }),
    });
  },

  async adminDeletePost(postId: string, adminSecret: string) {
    return request<{ success: boolean; message: string }>(`/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-secret': adminSecret,
      },
    });
  },
};
