'use client';

import React, { use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { FileText, Calendar, Eye, ArrowLeft, Share2, Clock, ChevronRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

type PostDetailStyle = 'classic' | 'modern' | 'minimal';

function usePostDetailStyle(): PostDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_detail_style' });
  return (setting?.value as PostDetailStyle) || 'classic';
}

// Hook để lấy danh sách các fields đang bật cho posts module
function useEnabledPostFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'posts' });
  return useMemo(() => {
    if (!fields) return new Set<string>();
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = usePostDetailStyle();
  const enabledFields = useEnabledPostFields();
  const post = useQuery(api.posts.getBySlug, { slug });
  const category = useQuery(
    api.postCategories.getById, 
    post?.categoryId ? { id: post.categoryId } : 'skip'
  );
  const incrementViews = useMutation(api.posts.incrementViews);
  
  // Related posts - lấy cùng category
  const relatedPosts = useQuery(
    api.posts.listByCategory,
    post?.categoryId 
      ? { categoryId: post.categoryId, status: 'Published', paginationOpts: { numItems: 4, cursor: null } }
      : 'skip'
  );

  // Increment views on mount
  useEffect(() => {
    if (post?._id) {
      incrementViews({ id: post._id });
    }
  }, [post?._id, incrementViews]);

  if (post === undefined) {
    return <PostDetailSkeleton />;
  }

  if (post === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-500 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Filter out current post from related
  const filteredRelated = relatedPosts?.page.filter(p => p._id !== post._id).slice(0, 3) || [];

  const postData = {
    ...post,
    categoryName: category?.name || 'Tin tức',
  };

  return (
    <>
      {style === 'classic' && <ClassicStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'modern' && <ModernStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'minimal' && <MinimalStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
    </>
  );
}

interface PostData {
  _id: Id<"posts">;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: Id<"postCategories">;
  categoryName: string;
  views: number;
  publishedAt?: number;
}

interface RelatedPost {
  _id: Id<"posts">;
  title: string;
  slug: string;
  thumbnail?: string;
  publishedAt?: number;
}

interface StyleProps {
  post: PostData;
  brandColor: string;
  relatedPosts: RelatedPost[];
  enabledFields: Set<string>;
}

// Style 1: Classic - Truyền thống với sidebar
function ClassicStyle({ post, brandColor, relatedPosts }: StyleProps) {
  return (
    <div className="py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-slate-900">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/posts" className="hover:text-slate-900">Bài viết</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Header */}
            <header className="mb-6">
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                {post.categoryName}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                </span>
                <span className="flex items-center gap-1"><Eye size={14} />{post.views}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{Math.ceil(post.content.length / 1000)} phút</span>
              </div>
            </header>

            {/* Featured Image */}
            {post.thumbnail && (
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Share */}
            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-3">
              <span className="text-sm text-slate-600">Chia sẻ:</span>
              <button aria-label="Chia sẻ bài viết" className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity duration-200" style={{ backgroundColor: brandColor }}>
                <Share2 size={16} />
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {relatedPosts.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">Bài viết liên quan</h3>
                  <div className="space-y-3">
                    {relatedPosts.map((p) => (
                      <Link key={p._id} href={`/posts/${p.slug}`} className="flex gap-2 group">
                        <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-200">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText size={14} className="text-slate-400" /></div>
                          )}
                        </div>
                        <h4 className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200 flex-1">{p.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link href="/posts" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                <ArrowLeft size={16} />
                Tất cả bài viết
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Style 2: Modern - Medium/Substack inspired - Focus on typography and reading experience
function ModernStyle({ post, brandColor, relatedPosts, enabledFields }: StyleProps) {
  const readingTime = Math.ceil(post.content.length / 1000);
  const showExcerpt = enabledFields.has('excerpt');
  
  return (
    <div className="bg-white">
      {/* Clean Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/posts" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition-colors">
              <ArrowLeft size={14} />
              <span>Bài viết</span>
            </Link>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: brandColor }}>{post.categoryName}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{post.title}</h1>
          
          {showExcerpt && post.excerpt && (
            <p className="text-lg text-slate-600 mb-4">{post.excerpt}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{readingTime} phút đọc</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1"><Eye size={14} />{post.views.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <figure className="max-w-4xl mx-auto px-4 py-6">
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </figure>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 py-6">
        <div 
          className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:italic prose-img:rounded-lg prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
          style={{ '--tw-prose-quote-borders': brandColor } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Bottom Section */}
      <div className="border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Chủ đề:</span>
              <span className="text-sm font-medium px-3 py-1 rounded" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>{post.categoryName}</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
              <Share2 size={14} />
              Chia sẻ
            </button>
          </div>

          <div className="py-6 text-center">
            <Link href="/posts" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded text-white text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: brandColor }}>
              Khám phá thêm
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-base font-bold text-slate-900 mb-4">Bài viết cùng chủ đề</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <Link key={p._id} href={`/posts/${p.slug}`} className="group">
                  <article className="flex md:flex-col gap-3">
                    <div className="w-20 h-16 md:w-full md:h-auto md:aspect-[16/10] rounded overflow-hidden bg-slate-200 flex-shrink-0">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><FileText size={20} className="text-slate-400" /></div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">{p.title}</h3>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Style 3: Minimal - Tối giản, tập trung nội dung
function MinimalStyle({ post, brandColor, relatedPosts }: StyleProps) {
  return (
    <div className="py-8 px-4">
      <article className="max-w-2xl mx-auto">
        <Link href="/posts" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Bài viết
        </Link>

        <header className="mb-6 text-center">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: brandColor }}>{post.categoryName}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-3">{post.title}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
            <span>·</span>
            <span>{Math.ceil(post.content.length / 1000)} phút</span>
            <span>·</span>
            <span>{post.views} views</span>
          </div>
        </header>

        {post.thumbnail && (
          <div className="aspect-[2/1] rounded-lg overflow-hidden mb-6">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-slate prose-sm max-w-none prose-headings:font-semibold prose-p:text-slate-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="my-8 flex items-center justify-center">
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="mx-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
          <div className="w-12 h-px bg-slate-200"></div>
        </div>

        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4 text-center">Đọc thêm</h3>
            <div className="space-y-2">
              {relatedPosts.map((p) => (
                <Link key={p._id} href={`/posts/${p.slug}`} className="block py-3 border-b border-slate-100 hover:border-slate-300 transition-colors duration-200 group">
                  <h4 className="text-sm font-medium text-slate-900 group-hover:opacity-70 transition-opacity duration-200">{p.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

// Skeleton Loading Component
function PostDetailSkeleton() {
  return (
    <div className="py-8 px-4 animate-pulse">
      <div className="max-w-3xl mx-auto">
        {/* Back link skeleton */}
        <div className="h-4 w-32 bg-slate-200 rounded mb-8" />
        
        {/* Header skeleton */}
        <div className="mb-10 text-center">
          <div className="h-3 w-20 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-10 w-3/4 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-4 w-48 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Featured Image skeleton */}
        <div className="aspect-[2/1] rounded-lg bg-slate-200 mb-10" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
