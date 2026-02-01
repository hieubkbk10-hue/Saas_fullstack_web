import React from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';

type CommentsRatingPreviewProps = {
  ratingDisplayStyle: 'stars' | 'numbers' | 'both';
  commentsSortOrder: 'newest' | 'oldest' | 'highest-rating' | 'most-liked';
  showLikes: boolean;
  showReplies: boolean;
  showModeration: boolean;
};

export function CommentsRatingPreview({
  ratingDisplayStyle,
  commentsSortOrder,
  showLikes,
  showReplies,
  showModeration,
}: CommentsRatingPreviewProps) {
  const RatingDisplay = ({ score = 4.5 }: { score?: number }) => {
    if (ratingDisplayStyle === 'numbers') {
      return <span className="text-amber-600 dark:text-amber-400 font-medium">{score}/5</span>;
    }
    if (ratingDisplayStyle === 'stars') {
      return (
        <div className="flex gap-0.5 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < Math.floor(score) ? 'currentColor' : 'none'} />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < Math.floor(score) ? 'currentColor' : 'none'} />
          ))}
        </div>
        <span className="text-amber-600 dark:text-amber-400 font-medium">{score}</span>
      </div>
    );
  };

  const sortLabels = {
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất',
    'highest-rating': 'Điểm cao',
    'most-liked': 'Nhiều like',
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded p-2 space-y-1">
        <div className="font-medium text-purple-700 dark:text-purple-400">
          Rating: {ratingDisplayStyle}
        </div>
        <div className="text-purple-600 dark:text-purple-500">
          Sort: {sortLabels[commentsSortOrder]}
        </div>
      </div>

      <div className="border border-purple-200 dark:border-purple-700 rounded p-2 space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={12} className="text-purple-500" />
          <span className="font-medium text-purple-700 dark:text-purple-400">Đánh giá</span>
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="border-l-2 border-purple-300 dark:border-purple-700 pl-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">User {i}</span>
              </div>
              <RatingDisplay score={i === 1 ? 5 : 4} />
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 rounded p-1 text-slate-600 dark:text-slate-400">
              Sản phẩm rất tốt, giao hàng nhanh!
            </div>

            <div className="flex items-center gap-2">
              {showLikes && (
                <div className="flex items-center gap-0.5 text-slate-500">
                  <ThumbsUp size={8} />
                  <span>12</span>
                </div>
              )}
              {showReplies && (
                <button className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                  <MessageSquare size={8} />
                  <span>Reply</span>
                </button>
              )}
              {showModeration && i === 2 && (
                <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1 rounded">
                  Pending
                </span>
              )}
            </div>

            {showReplies && i === 1 && (
              <div className="ml-4 border-l border-purple-200 dark:border-purple-800 pl-2 space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-600 dark:text-slate-400">Admin</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded p-1 text-slate-500">
                  Cảm ơn bạn đã ủng hộ!
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
