import React from 'react';
import { MessageSquare, Share2, User } from 'lucide-react';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type PostDetailPreviewProps = {
  layoutStyle: DetailLayoutStyle;
  showAuthor: boolean;
  showRelated: boolean;
  showShare: boolean;
  showComments: boolean;
};

export function PostDetailPreview({
  layoutStyle,
  showAuthor,
  showRelated,
  showShare,
  showComments,
}: PostDetailPreviewProps) {
  const ArticleContent = () => (
    <div className="space-y-2">
      <div className="bg-slate-200 dark:bg-slate-700 rounded h-3 w-3/4" />
      {showAuthor && (
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <User size={10} />
          <span>Author Name</span>
          <span>•</span>
          <span>Jan 1, 2026</span>
        </div>
      )}
      {showShare && (
        <div className="flex gap-1">
          <Share2 size={10} className="text-blue-500" />
          <span className="text-blue-600 dark:text-blue-400">Share</span>
        </div>
      )}
      <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-video" />
      <div className="space-y-1">
        <div className="bg-slate-200 dark:bg-slate-700 rounded h-1" />
        <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-4/5" />
        <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-3/4" />
      </div>
    </div>
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2">
        <span className="font-medium text-blue-700 dark:text-blue-400">Layout: {layoutStyle}</span>
      </div>

      {layoutStyle === 'classic' && (
        <div className="border border-slate-200 dark:border-slate-700 rounded p-2">
          <ArticleContent />
          {showComments && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                <MessageSquare size={10} />
                <span className="font-medium">Comments (3)</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded p-1 text-slate-500">
                Comment content...
              </div>
            </div>
          )}
          {showRelated && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">Related Posts</div>
              <div className="grid grid-cols-2 gap-1">
                {[1, 2].map(i => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded p-1">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded h-8" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {layoutStyle === 'modern' && (
        <div className="space-y-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded h-24 flex items-center justify-center text-slate-500">
            Hero Image
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded p-2">
            <ArticleContent />
          </div>
          {showComments && (
            <div className="border border-slate-200 dark:border-slate-700 rounded p-2">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <MessageSquare size={10} />
                <span>Comments</span>
              </div>
            </div>
          )}
        </div>
      )}

      {layoutStyle === 'minimal' && (
        <div className="max-w-full space-y-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded h-3 w-2/3 mx-auto" />
          {showAuthor && (
            <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
              <User size={8} />
              <span>Author</span>
            </div>
          )}
          <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-video" />
          <div className="space-y-1 px-2">
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-1" />
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-5/6 mx-auto" />
          </div>
          {showShare && (
            <div className="flex justify-center gap-1 text-blue-500">
              <Share2 size={8} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ServiceDetailPreview(props: PostDetailPreviewProps) {
  return <PostDetailPreview {...props} />;
}
