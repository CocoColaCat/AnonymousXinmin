export type CategoryType = 
  | '全部'
  | '閒聊'
  | '告白'
  | '抱怨'
  | '課業'
  | '心事'
  | '生活'
  | '求助'
  | '公告';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds?: string[];
}

export interface PostReaction {
  like: number;
  heart: number;
  laugh: number;
  sad: number;
  angry: number;
  userReactions?: Record<string, string>;
}

export interface Comment {
  id: string;
  postId: string;
  floor: number;
  alias: string;
  content: string;
  createdAt: string;
  likes: number;
  replyToFloor?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: CategoryType;
  alias: string;
  cardTheme: 'default' | 'pink' | 'yellow' | 'purple' | 'blue' | 'dark';
  createdAt: string;
  reactions: PostReaction;
  commentCount: number;
  comments?: Comment[];
  imageUrl?: string;
  poll?: {
    question: string;
    options: PollOption[];
  };
  isPinned?: boolean;
  reportsCount: number;
  isModerated?: boolean;
}

export type SortType = 'latest' | 'hot' | 'most_commented' | 'pinned';

export interface CreatePostPayload {
  title: string;
  content: string;
  category: CategoryType;
  alias?: string;
  cardTheme?: Post['cardTheme'];
  imageUrl?: string;
  pollQuestion?: string;
  pollOptions?: string[];
}

export interface CreateCommentPayload {
  content: string;
  alias?: string;
  replyToFloor?: number;
}
