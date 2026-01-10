'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { Loader2, FileText, Calendar, Eye, ArrowLeft, Share2, Clock, Tag, ChevronRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

type PostDetailStyle = 'classic' | 'modern' | 'minimal';

function usePostDetailStyle(): PostDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_detail_style' });
  return (setting?.value as PostDetailStyle) || 'classic';
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = usePostDetailStyle();
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
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
      {style === 'classic' && <ClassicStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} />}
      {style === 'modern' && <ModernStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} />}
      {style === 'minimal' && <MinimalStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} />}
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
}

// Style 1: Classic - Truyền thống với sidebar
function ClassicStyle({ post, brandColor, relatedPosts }: StyleProps) {
  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/posts" className="hover:text-slate-900">Bài viết</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Header */}
            <header className="mb-8">
              <span 
                className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                {post.categoryName}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  }) : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {post.views} lượt xem
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {Math.ceil(post.content.length / 1000)} phút đọc
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {post.thumbnail && (
              <div className="aspect-video rounded-xl overflow-hidden mb-8">
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Chia sẻ:</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Bài viết liên quan</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((p) => (
                      <Link key={p._id} href={`/posts/${p.slug}`} className="flex gap-3 group">
                        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText size={16} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {p.title}
                          </h4>
                          <span className="text-xs text-slate-400 mt-1">
                            {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <Link 
                href="/posts"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <ArrowLeft size={18} />
                Tất cả bài viết
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Style 2: Modern - Hero lớn, full-width
function ModernStyle({ post, brandColor, relatedPosts }: StyleProps) {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-slate-900">
        {post.thumbnail && (
          <>
            <div 
              className="absolute inset-0 scale-105"
              style={{ 
                backgroundImage: `url(${post.thumbnail})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                filter: 'blur(20px)'
              }} 
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <Link 
            href="/posts"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại
          </Link>
          <span 
            className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 text-white"
            style={{ backgroundColor: brandColor }}
          >
            {post.categoryName}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              }) : ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {post.views} lượt xem
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {Math.ceil(post.content.length / 1000)} phút đọc
            </span>
          </div>
        </div>
      </div>

      {/* Featured Image - Overlapping */}
      {post.thumbnail && (
        <div className="max-w-4xl mx-auto px-4 -mt-8">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={post.thumbnail} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div 
          className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share & Tags */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-slate-400" />
            <span 
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              {post.categoryName}
            </span>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: brandColor }}
          >
            <Share2 size={16} />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Bài viết liên quan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link key={p._id} href={`/posts/${p.slug}`} className="group">
                  <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      {p.thumbnail ? (
                        <img 
                          src={p.thumbnail} 
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={32} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h3>
                      <span className="text-xs text-slate-400 mt-2 block">
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
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
    <div className="py-12 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link 
          href="/posts"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Tất cả bài viết
        </Link>

        {/* Header */}
        <header className="mb-10 text-center">
          <span 
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: brandColor }}
          >
            {post.categoryName}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }) : ''}</span>
            <span>·</span>
            <span>{Math.ceil(post.content.length / 1000)} phút đọc</span>
            <span>·</span>
            <span>{post.views} views</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.thumbnail && (
          <div className="aspect-[2/1] rounded-lg overflow-hidden mb-10">
            <img 
              src={post.thumbnail} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-slate max-w-none prose-headings:font-semibold prose-p:text-slate-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Divider */}
        <div className="my-12 flex items-center justify-center">
          <div className="w-16 h-px bg-slate-200"></div>
          <div className="mx-4 w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }}></div>
          <div className="w-16 h-px bg-slate-200"></div>
        </div>

        {/* Related - Minimal List */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400 mb-6 text-center">Đọc thêm</h3>
            <div className="space-y-4">
              {relatedPosts.map((p) => (
                <Link 
                  key={p._id} 
                  href={`/posts/${p.slug}`}
                  className="block py-4 border-b border-slate-100 hover:border-slate-300 transition-colors group"
                >
                  <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h4>
                  <span className="text-xs text-slate-400 mt-1">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
