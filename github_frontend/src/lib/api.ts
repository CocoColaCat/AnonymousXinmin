import { Post, CategoryType, SortType, CreatePostPayload, CreateCommentPayload } from '../types';
import { BACKEND_API_URL, RENDER_BACKEND_URL_PRIMARY, RENDER_BACKEND_URL_SECONDARY } from '../config';

let activeWorkingBaseUrl: string | null = null;

// Default API Base URL (relative /api or custom BACKEND_API_URL from config.ts)
export function getApiBaseUrl(): string {
  if (activeWorkingBaseUrl) return activeWorkingBaseUrl;
  const custom = localStorage.getItem('XINMIN_API_URL');
  if (custom && custom.trim() !== '' && custom.trim() !== '/api') {
    return custom.trim().replace(/\/$/, '');
  }
  return BACKEND_API_URL;
}

export function setApiBaseUrl(url: string) {
  if (!url || !url.trim()) {
    localStorage.removeItem('XINMIN_API_URL');
    activeWorkingBaseUrl = null;
  } else {
    const formatted = url.trim().replace(/\/$/, '');
    localStorage.setItem('XINMIN_API_URL', formatted);
    activeWorkingBaseUrl = formatted;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const primaryBaseUrl = getApiBaseUrl();
  const candidates = [
    primaryBaseUrl,
    RENDER_BACKEND_URL_PRIMARY,
    RENDER_BACKEND_URL_SECONDARY,
    '/api'
  ].filter((url, idx, self) => Boolean(url) && self.indexOf(url) === idx);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let lastError: any = null;

  for (const baseUrl of candidates) {
    const fullUrl = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
    try {
      const response = await fetch(fullUrl, { ...options, headers });

      if (response.ok) {
        // Cache working base URL for subsequent requests
        activeWorkingBaseUrl = baseUrl;
        return await response.json();
      }

      const errData = await response.json().catch(() => ({}));

      // Handle Ban error strictly without fallback loop
      if (response.status === 403 && errData.error === 'banned') {
        const err = new Error(errData.message || '您已被停權');
        (err as any).isBanError = true;
        (err as any).banDetails = errData;
        throw err;
      }

      // Handle VPN / Proxy detection error strictly without fallback loop
      if ((response.status === 403 || response.status === 400) && errData.error === 'vpn_detected') {
        const err = new Error(errData.message || '你的網路觸發了安全防護請重開網路或者是關閉VPN或Proxy');
        (err as any).isVpnError = true;
        (err as any).vpnDetails = errData;
        throw err;
      }

      // Explicit business logic errors from real backend (e.g. wrong admin password, validation error)
      if (errData && errData.error && (response.status === 403 || response.status === 400 || response.status === 401)) {
        throw new Error(errData.error);
      }

      // If 404, 405 (static host POST disallowed), 502, 503, 504 (Render cold start), try next candidate URL
      if (
        response.status === 404 ||
        response.status === 405 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        if (activeWorkingBaseUrl === baseUrl) {
          activeWorkingBaseUrl = null;
        }
        lastError = new Error(errData.error || `HTTP ${response.status}: 請求失敗`);
        continue;
      }

      // Other unexpected errors
      throw new Error(errData.error || `HTTP ${response.status}: 請求失敗`);
    } catch (error: any) {
      if (error.isBanError || error.isVpnError) throw error;
      if (error.message && (error.message.includes('密碼錯誤') || error.message.includes('權限'))) {
        throw error;
      }
      lastError = error;
      // Network failure or timeout -> try next candidate URL
      continue;
    }
  }

  console.error(`API Error on ${endpoint}:`, lastError);
  throw lastError || new Error('所有後端伺服器連接失敗');
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

  async getUserInteractions(): Promise<{
    ip: string;
    reactions: Record<string, string>;
    commentLikes: string[];
    pollVotes: Record<string, string>;
  }> {
    return request('/user-interactions');
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

  async reactToPost(id: string, reactionType: 'like' | 'heart' | 'laugh' | 'sad' | 'angry'): Promise<{ id: string; reactions: Post['reactions']; myReaction: string | null }> {
    return request<{ id: string; reactions: Post['reactions']; myReaction: string | null }>(`/posts/${id}/react`, {
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

  async likeComment(postId: string, commentId: string): Promise<{ comment: any; liked: boolean }> {
    return request<{ comment: any; liked: boolean }>(`/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  async votePoll(postId: string, optionId: string): Promise<{ poll: any; myVote: string }> {
    return request<{ poll: any; myVote: string }>(`/posts/${postId}/vote`, {
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
