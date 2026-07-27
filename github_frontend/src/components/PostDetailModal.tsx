import React, { useState, useEffect } from 'react';
import { Post, Comment } from '../types';
import { X, Send, Heart, MessageSquare, CornerDownRight, User, AlertCircle } from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onAddComment: (postId: string, content: string, alias?: string, replyToFloor?: number) => Promise<void>;
  onLikeComment: (postId: string, commentId: string) => Promise<void>;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onAddComment,
  onLikeComment
}) => {
  if (!post) return null;

  const savedNickname = typeof window !== 'undefined' ? (localStorage.getItem('xinmin_user_nickname') || '') : '';

  const [commentText, setCommentText] = useState('');
  const [alias, setAlias] = useState(savedNickname);
  const [replyToFloor, setReplyToFloor] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (savedNickname && !alias) {
      setAlias(savedNickname);
    }
  }, [savedNickname]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onAddComment(post.id, commentText, alias, replyToFloor || undefined);
      setCommentText('');
      setReplyToFloor(null);
    } catch (err: any) {
      setErrorMsg(err.message || '留言發送失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (floor: number) => {
    setReplyToFloor(floor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-2xl max-h-[90vh] rounded-none shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden border border-[#222]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs font-bold px-2 py-0.5 bg-[#141414] text-[#CBFF00] border border-[#CBFF00]/40 uppercase tracking-widest">
              #{post.category}
            </span>
            <span className="text-xs font-bold text-neutral-300">{post.alias}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-[#CBFF00] hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Post Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3 leading-snug tracking-tight">
              {post.title}
            </h2>
            <div className="text-xs font-mono text-neutral-500 mb-4">
              發布時間：{new Date(post.createdAt).toLocaleString('zh-TW')}
            </div>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="rounded-none border border-[#333] max-h-96 overflow-hidden bg-[#0A0A0A]">
              <img
                src={post.imageUrl}
                alt="貼文圖片"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="border-t border-[#222] pt-4" />

          {/* Comment Section Header */}
          <div className="flex items-center justify-between font-mono">
            <h3 className="text-xs font-bold text-[#CBFF00] flex items-center gap-2 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-[#CBFF00]" />
              <span>討論與留言 ({post.comments?.length || 0})</span>
            </h3>
          </div>

          {/* Comment List */}
          <div className="space-y-3 font-mono">
            {(!post.comments || post.comments.length === 0) ? (
              <div className="text-center py-8 text-neutral-500 text-xs bg-[#0A0A0A] border border-dashed border-[#333]">
                目前還沒有人留言，搶頭香成為 B1 吧！💬
              </div>
            ) : (
              post.comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 rounded-none bg-[#0A0A0A] border border-[#222] hover:border-[#444] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#CBFF00]">B{comment.floor}</span>
                      <span className="font-bold text-neutral-300">{comment.alias}</span>
                      {comment.replyToFloor && (
                        <span className="text-[10px] text-[#CBFF00] bg-[#141414] border border-[#CBFF00]/30 px-1.5 py-0.5 flex items-center gap-0.5">
                          <CornerDownRight className="w-3 h-3 text-[#CBFF00]" />
                          <span>回覆 B{comment.replyToFloor}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed mb-2 font-sans">
                    {comment.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <button
                      onClick={() => handleReplyClick(comment.floor)}
                      className="hover:text-[#CBFF00] font-bold flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>回覆此樓</span>
                    </button>

                    <button
                      onClick={() => onLikeComment(post.id, comment.id)}
                      className="flex items-center gap-1 hover:text-rose-400 font-bold transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Comment Input Footer */}
        <div className="p-4 bg-[#0A0A0A] border-t border-[#222]">
          
          {errorMsg && (
            <div className="mb-2 text-xs text-rose-400 bg-rose-950/40 p-2 border border-rose-800 flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {replyToFloor && (
            <div className="mb-2 text-xs bg-[#141414] text-[#CBFF00] px-3 py-1 border border-[#CBFF00]/40 flex items-center justify-between font-mono">
              <span>準備回覆 <strong>B{replyToFloor}</strong> 樓層</span>
              <button
                onClick={() => setReplyToFloor(null)}
                className="text-neutral-400 hover:text-[#CBFF00] text-xs font-bold"
              >
                取消
              </button>
            </div>
          )}

          <form onSubmit={handleSendComment} className="space-y-2 font-mono">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`以「${alias || '匿名新民'}」身份發表留言...`}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#141414] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="px-4 py-2 bg-[#CBFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-black text-xs uppercase border border-[#CBFF00] flex items-center gap-1.5 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>送出</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
