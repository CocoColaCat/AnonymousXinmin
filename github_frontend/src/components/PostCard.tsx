import React, { useState } from 'react';
import { Post } from '../types';
import { MessageSquare, Pin, Flag, Heart, ThumbsUp, Laugh, Frown, CheckCircle2 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClickDetail: (post: Post) => void;
  onReact: (postId: string, reactionType: 'like' | 'heart' | 'laugh' | 'sad' | 'angry') => void;
  onVote: (postId: string, optionId: string) => void;
  onReport: (postId: string) => void;
}

const themeStyles: Record<Post['cardTheme'], { cardBg: string; border: string; headerText: string }> = {
  default: { cardBg: 'bg-[#141414]', border: 'border-[#222] hover:border-[#CBFF00]', headerText: 'text-[#F0F0F0]' },
  pink: { cardBg: 'bg-[#1A1114]', border: 'border-rose-900/80 hover:border-rose-400', headerText: 'text-rose-200' },
  yellow: { cardBg: 'bg-[#1A1811]', border: 'border-amber-900/80 hover:border-[#CBFF00]', headerText: 'text-amber-200' },
  purple: { cardBg: 'bg-[#15111A]', border: 'border-purple-900/80 hover:border-purple-400', headerText: 'text-purple-200' },
  blue: { cardBg: 'bg-[#11171A]', border: 'border-sky-900/80 hover:border-sky-400', headerText: 'text-sky-200' },
  dark: { cardBg: 'bg-[#0A0A0A]', border: 'border-[#333] hover:border-[#CBFF00]', headerText: 'text-white' }
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onClickDetail,
  onReact,
  onVote,
  onReport
}) => {
  const [reported, setReported] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const theme = themeStyles[post.cardTheme] || themeStyles.default;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return '剛剛';
      if (diffMins < 60) return `${diffMins} 分鐘前`;
      if (diffHours < 24) return `${diffHours} 小時前`;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    } catch {
      return isoString;
    }
  };

  const totalPollVotes = post.poll?.options.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  const handleVote = (e: React.MouseEvent, optId: string) => {
    e.stopPropagation();
    if (votedOptionId) return;
    setVotedOptionId(optId);
    onVote(post.id, optId);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reported) return;
    setReported(true);
    onReport(post.id);
  };

  return (
    <article
      onClick={() => onClickDetail(post)}
      className={`rounded-none border p-4 sm:p-5 transition-all cursor-pointer shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#CBFF00] hover:-translate-x-0.5 hover:-translate-y-0.5 ${theme.cardBg} ${theme.border} relative group`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-black bg-[#CBFF00] text-black px-2 py-0.5 uppercase tracking-wider">
              <Pin className="w-3 h-3 fill-black" />
              <span>置頂公告</span>
            </span>
          )}

          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0A0A0A] text-[#CBFF00] border border-[#CBFF00]/40 uppercase tracking-widest">
            #{post.category}
          </span>

          <span className="text-xs font-bold text-neutral-300">
            {post.alias}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 shrink-0">
          <span>{formatDate(post.createdAt)}</span>
          <button
            onClick={handleReport}
            title="檢舉此貼文"
            className={`p-1 transition-colors ${
              reported ? 'text-rose-500 font-bold' : 'hover:bg-[#222] text-neutral-500 hover:text-rose-400'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className={`text-base sm:text-lg font-black mb-2 leading-snug tracking-tight ${theme.headerText}`}>
        {post.title}
      </h3>

      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line line-clamp-4 mb-4 text-neutral-300">
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="mb-4 rounded-none border border-[#333] max-h-72 overflow-hidden bg-[#0A0A0A]">
          <img
            src={post.imageUrl}
            alt="貼文附圖"
            className="w-full h-full object-cover hover:scale-102 transition-transform duration-300 grayscale hover:grayscale-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {post.poll && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-4 p-3.5 rounded-none border border-[#333] bg-[#0A0A0A]"
        >
          <div className="text-xs font-mono font-bold mb-2.5 flex items-center justify-between text-[#CBFF00]">
            <span>📊 {post.poll.question}</span>
            <span className="text-[10px] text-neutral-500 font-normal">TOTAL {totalPollVotes} VOTES</span>
          </div>

          <div className="space-y-2">
            {post.poll.options.map((opt) => {
              const optVotes = opt.votes + (votedOptionId === opt.id ? 1 : 0);
              const currentTotal = totalPollVotes + (votedOptionId ? 1 : 0);
              const pct = currentTotal > 0 ? Math.round((optVotes / currentTotal) * 100) : 0;
              const isSelected = votedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={(e) => handleVote(e, opt.id)}
                  className={`w-full text-left relative overflow-hidden rounded-none border p-2.5 transition-all text-xs flex items-center justify-between font-mono ${
                    isSelected
                      ? 'border-[#CBFF00] bg-[#CBFF00]/10 font-bold text-[#CBFF00]'
                      : 'border-[#222] bg-[#141414] hover:border-[#444]'
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500 ${
                      isSelected ? 'bg-[#CBFF00]' : 'bg-neutral-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />

                  <span className="relative z-10 flex items-center gap-1.5 font-medium">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#CBFF00]" />}
                    <span>{opt.text}</span>
                  </span>

                  <span className="relative z-10 text-[11px] font-bold text-neutral-400">
                    {pct}% ({optVotes})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#222] text-xs font-mono">
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 sm:gap-2 flex-wrap"
        >
          <button
            onClick={() => onReact(post.id, 'like')}
            className="flex items-center gap-1 px-2 py-1 rounded-none bg-[#0A0A0A] border border-[#222] hover:border-[#CBFF00] text-neutral-300 transition-colors"
            title="讚"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-[11px]">{post.reactions?.like || 0}</span>
          </button>

          <button
            onClick={() => onReact(post.id, 'heart')}
            className="flex items-center gap-1 px-2 py-1 rounded-none bg-[#0A0A0A] border border-[#222] hover:border-[#CBFF00] text-neutral-300 transition-colors"
            title="心動"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span className="font-bold text-[11px]">{post.reactions?.heart || 0}</span>
          </button>

          <button
            onClick={() => onReact(post.id, 'laugh')}
            className="flex items-center gap-1 px-2 py-1 rounded-none bg-[#0A0A0A] border border-[#222] hover:border-[#CBFF00] text-neutral-300 transition-colors"
            title="哈哈"
          >
            <Laugh className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-[11px]">{post.reactions?.laugh || 0}</span>
          </button>

          <button
            onClick={() => onReact(post.id, 'sad')}
            className="flex items-center gap-1 px-2 py-1 rounded-none bg-[#0A0A0A] border border-[#222] hover:border-[#CBFF00] text-neutral-300 transition-colors"
            title="嗚嗚"
          >
            <Frown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-[11px]">{post.reactions?.sad || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-neutral-400 font-bold hover:text-[#CBFF00] transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{post.commentCount || 0} 留言</span>
        </div>
      </div>
    </article>
  );
};
