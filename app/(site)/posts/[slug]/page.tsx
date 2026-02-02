'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Noto_Sans } from 'next/font/google';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { Button, Card, CardContent } from '@/app/admin/components/ui';
import { ArrowLeft, Calendar, Check, ChevronRight, Clock, Eye, FileText, Heart, Home, Link as LinkIcon, Reply, Share2, User } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

const notoSans = Noto_Sans({
  display: 'swap',
  subsets: ['vietnamese', 'latin'],
});

type PostDetailStyle = 'classic' | 'modern' | 'minimal';

function usePostDetailStyle(): PostDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_detail_style' });
  return (setting?.value as PostDetailStyle) || 'classic';
}

// Hook để lấy danh sách các fields đang bật cho posts module
function useEnabledPostFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'posts' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

function useImageFallback() {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const markBroken = React.useCallback((src?: string | null) => {
    if (!src) {return;}
    setBrokenImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  const isBroken = React.useCallback((src?: string | null) => Boolean(src && brokenImages[src]), [brokenImages]);

  return { isBroken, markBroken };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = usePostDetailStyle();
  const enabledFields = useEnabledPostFields();
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'posts_detail_ui' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const commentsLikesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableLikes', moduleKey: 'comments' });
  const commentsRepliesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableReplies', moduleKey: 'comments' });
  const post = useQuery(api.posts.getBySlug, { slug });
  const category = useQuery(
    api.postCategories.getById, 
    post?.categoryId ? { id: post.categoryId } : 'skip'
  );
  const incrementViews = useMutation(api.posts.incrementViews);
  const createComment = useMutation(api.comments.create);
  const experienceConfig = useMemo(() => {
    const raw = experienceSetting?.value as Partial<{ showAuthor?: boolean; showComments?: boolean; showCommentLikes?: boolean; showCommentReplies?: boolean }> | undefined;
    return {
      showAuthor: raw?.showAuthor ?? true,
      showComments: raw?.showComments ?? true,
      showCommentLikes: raw?.showCommentLikes ?? (commentsLikesFeature?.enabled ?? false),
      showCommentReplies: raw?.showCommentReplies ?? (commentsRepliesFeature?.enabled ?? true),
    };
  }, [commentsLikesFeature?.enabled, commentsRepliesFeature?.enabled, experienceSetting?.value]);

  const shouldShowAuthor = enabledFields.has('author_name') && experienceConfig.showAuthor;
  const authorName = post?.authorName ?? '';
  const commentsEnabled = commentsModule?.enabled ?? false;
  const shouldShowComments = commentsEnabled && experienceConfig.showComments;
  const shouldShowCommentLikes = shouldShowComments && style === 'classic' && (commentsLikesFeature?.enabled ?? false) && experienceConfig.showCommentLikes;
  const shouldShowCommentReplies = shouldShowComments && style === 'classic' && (commentsRepliesFeature?.enabled ?? false) && experienceConfig.showCommentReplies;
  const commentsPage = useQuery(
    api.comments.listByTarget,
    post && shouldShowComments
      ? { paginationOpts: { cursor: null, numItems: 20 }, status: 'Approved', targetId: post._id, targetType: 'post' }
      : 'skip'
  );
  const comments = commentsPage?.page ?? [];
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentMessage, setCommentMessage] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Related posts - lấy cùng category
  const relatedPosts = useQuery(
    api.posts.listByCategory,
    post?.categoryId 
      ? { categoryId: post.categoryId, paginationOpts: { cursor: null, numItems: 4 }, status: 'Published' }
      : 'skip'
  );

  // Increment views on mount
  useEffect(() => {
    if (post?._id) {
      void incrementViews({ id: post._id });
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
  const filteredRelated = relatedPosts?.page.filter(p => p._id !== post._id).slice(0, 3) ?? [];

  const postData = {
    ...post,
    categoryName: category?.name ?? 'Tin tức',
  };

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post || !commentName.trim() || !commentContent.trim()) {return;}
    setIsSubmittingComment(true);
    setCommentMessage(null);
    try {
      await createComment({
        authorEmail: commentEmail.trim() || undefined,
        authorName: commentName.trim(),
        content: commentContent.trim(),
        status: 'Pending',
        targetId: post._id,
        targetType: 'post',
      });
      setCommentName('');
      setCommentEmail('');
      setCommentContent('');
      setCommentMessage('Bình luận đã được gửi, vui lòng chờ duyệt.');
    } catch {
      setCommentMessage('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const commentsSection = shouldShowComments ? (
    <CommentsSection
      brandColor={brandColor}
      comments={comments}
      commentContent={commentContent}
      commentEmail={commentEmail}
      commentMessage={commentMessage}
      commentName={commentName}
      isSubmitting={isSubmittingComment}
      showLikes={shouldShowCommentLikes}
      showReplies={shouldShowCommentReplies}
      onContentChange={setCommentContent}
      onEmailChange={setCommentEmail}
      onNameChange={setCommentName}
      onSubmit={handleSubmitComment}
    />
  ) : null;

  return (
    <>
      {style === 'classic' && (
        <ClassicStyle
          post={postData}
          brandColor={brandColor}
          relatedPosts={filteredRelated}
          enabledFields={enabledFields}
          showAuthor={shouldShowAuthor}
          authorName={authorName}
          commentsSection={commentsSection}
        />
      )}
      {style === 'modern' && (
        <ModernStyle
          post={postData}
          brandColor={brandColor}
          relatedPosts={filteredRelated}
          enabledFields={enabledFields}
          showAuthor={shouldShowAuthor}
          authorName={authorName}
          commentsSection={commentsSection}
        />
      )}
      {style === 'minimal' && (
        <MinimalStyle
          post={postData}
          brandColor={brandColor}
          relatedPosts={filteredRelated}
          enabledFields={enabledFields}
          showAuthor={shouldShowAuthor}
          authorName={authorName}
          commentsSection={commentsSection}
        />
      )}
    </>
  );
}

interface PostData {
  _id: Id<"posts">;
  authorName?: string;
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

interface CommentData {
  _id: Id<"comments">;
  _creationTime: number;
  authorName: string;
  content: string;
}

interface RelatedPost {
  _id: Id<"posts">;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  publishedAt?: number;
}

interface StyleProps {
  post: PostData;
  brandColor: string;
  relatedPosts: RelatedPost[];
  enabledFields: Set<string>;
  showAuthor: boolean;
  authorName: string;
  commentsSection?: React.ReactNode;
}

// Style 1: Classic - Truyền thống với sidebar
function ClassicStyle({ post, brandColor, relatedPosts, showAuthor, authorName, commentsSection }: StyleProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const { isBroken, markBroken } = useImageFallback();
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () =>{  window.removeEventListener('scroll', handleScroll); };
  }, []);

  const handleShare = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() =>{  setIsCopied(false); }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-300"
        style={{ backgroundColor: brandColor, width: `${scrollProgress * 100}%` }}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Trang chủ</span>
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>
              <Link href="/posts" className="hover:text-foreground transition-colors">Bài viết</Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <article className="lg:col-span-9 space-y-8">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}30`, color: brandColor }}
                >
                  {post.categoryName}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2">
                {showAuthor && authorName && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{authorName}</span>
                    </div>
                    <span className="text-muted-foreground/40">•</span>
                  </>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} phút đọc</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </header>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/60 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              {post.thumbnail && !isBroken(post.thumbnail) ? (
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  ref={(img) => {
                    if (img?.complete && img.naturalWidth === 0) {
                      markBroken(post.thumbnail);
                    }
                  }}
                  onError={() =>{  markBroken(post.thumbnail); }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="prose prose-zinc prose-lg max-w-none lg:max-w-[640px] dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="border-t pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href="/posts"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tất cả bài viết
                </Link>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full sm:w-auto min-w-[140px]"
                  style={{ backgroundColor: isCopied ? `${brandColor}15` : brandColor, color: isCopied ? brandColor : '#fff' }}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {isCopied ? 'Đã copy link' : 'Chia sẻ'}
                </button>
              </div>
            </div>

            {commentsSection}
          </article>

          <aside className="lg:col-span-3 space-y-6">
            {relatedPosts.length > 0 && (
              <div className="h-fit sticky top-24 rounded-lg bg-muted/30">
                <div className="flex flex-col space-y-1.5 p-6 px-0 sm:px-6">
                  <h3 className="text-base font-semibold">Bài viết liên quan</h3>
                </div>
                <div className="p-6 pt-0 px-0 sm:px-6 gap-3 flex flex-col">
                  {relatedPosts.map((p) => (
                    <Link key={p._id} href={`/posts/${p.slug}`} className="group flex gap-3 items-start">
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted/60">
                        {p.thumbnail && !isBroken(p.thumbnail) ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            ref={(img) => {
                              if (img?.complete && img.naturalWidth === 0) {
                                markBroken(p.thumbnail);
                              }
                            }}
                            onError={() =>{  markBroken(p.thumbnail); }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-80 transition-colors">
                          {p.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

// Style 2: Modern - Medium/Substack inspired - Focus on typography and reading experience
function ModernStyle({ post, brandColor, relatedPosts, enabledFields, showAuthor, authorName, commentsSection }: StyleProps) {
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));
  const showExcerpt = enabledFields.has('excerpt');
  const [isCopied, setIsCopied] = useState(false);
  const { isBroken, markBroken } = useImageFallback();

  const handleCopyLink = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() =>{  setIsCopied(false); }, 2000);
    }
  };
  
  return (
    <div className={`min-h-screen bg-background pb-12 selection:bg-accent/30 ${notoSans.className}`}>
      <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-8 md:space-y-12">
        <div className="flex flex-col gap-4">
          <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Trang chủ</span>
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
              <li>
                <Link href="/posts" className="hover:text-foreground transition-colors">
                  Bài viết
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
              <li className="font-medium text-foreground truncate max-w-[200px] md:max-w-[360px]">
                {post.title}
              </li>
            </ol>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-input bg-background px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Copy link"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
              {isCopied ? 'Đã copy' : 'Copy link'}
            </button>
          </nav>

          <section className="max-w-7xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${brandColor}10`, borderColor: `${brandColor}25`, color: brandColor }}
              >
                {post.categoryName}
              </span>
            </div>

            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-tight text-foreground leading-[1.2] text-balance">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {showAuthor && authorName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time className="font-medium">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{readingTime} phút đọc</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{post.views.toLocaleString()} lượt xem</span>
              </div>
            </div>
          </section>
        </div>

        <section className="relative overflow-hidden rounded-2xl bg-muted aspect-[16/9] md:aspect-[21/9] max-w-7xl mx-auto">
          {post.thumbnail && !isBroken(post.thumbnail) ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-300 hover:scale-105"
              ref={(img) => {
                if (img?.complete && img.naturalWidth === 0) {
                  markBroken(post.thumbnail);
                }
              }}
              onError={() =>{  markBroken(post.thumbnail); }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <FileText className="h-14 w-14" />
            </div>
          )}
        </section>

        <article className="max-w-7xl mx-auto space-y-6">
          {showExcerpt && post.excerpt && (
            <p
              className="text-[clamp(1.125rem,2vw,1.5rem)] leading-relaxed text-foreground/90 font-medium border-l-4 pl-4"
              style={{ borderColor: brandColor }}
            >
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-loose">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {commentsSection}

        </article>

        {relatedPosts.length > 0 && (
          <section className="pt-6 pb-2">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Bài viết cùng chủ đề</h2>
                <Link href="/posts" className="text-sm font-medium" style={{ color: brandColor }}>
                  Xem thêm
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedPosts.map((p) => (
                  <Link
                    key={p._id}
                    href={`/posts/${p.slug}`}
                    className="group rounded-lg border bg-background p-4 shadow-sm transition-colors duration-200 flex flex-col"
                    style={{ borderColor: `${brandColor}25` }}
                  >
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted mb-3 relative">
                      {p.thumbnail && !isBroken(p.thumbnail) ? (
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          ref={(img) => {
                            if (img?.complete && img.naturalWidth === 0) {
                              markBroken(p.thumbnail);
                            }
                          }}
                          onError={() =>{  markBroken(p.thumbnail); }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    <span
                      className="mt-auto pt-3 self-end inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: brandColor }}
                    >
                      Xem ngay
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Style 3: Minimal - Tối giản, tập trung nội dung
function MinimalStyle({ post, brandColor, relatedPosts, showAuthor, authorName, commentsSection }: StyleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));
  const { isBroken, markBroken } = useImageFallback();

  const handleShare = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() =>{  setIsCopied(false); }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-16">
        <section className="relative w-full overflow-hidden bg-muted">
          <div className="relative h-[clamp(220px,45vh,520px)] w-full">
            {post.thumbnail && !isBroken(post.thumbnail) ? (
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover"
                ref={(img) => {
                  if (img?.complete && img.naturalWidth === 0) {
                    markBroken(post.thumbnail);
                  }
                }}
                onError={() =>{  markBroken(post.thumbnail); }}
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: `${brandColor}10` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 z-10">
              <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between pt-4">
                  <Link
                    href="/posts"
                    className="group inline-flex h-11 items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
                    aria-label="Quay lại"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    Danh sách
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    aria-label="Chia sẻ"
                    className="h-11 w-11 border-white/30 bg-white/15 text-white hover:bg-white/20"
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="container max-w-6xl mx-auto h-full px-4 md:px-6 flex items-end pb-6 md:pb-8">
              <Card className="w-full max-w-3xl border-border/70 bg-background/90 shadow-sm backdrop-blur-sm">
                <CardContent className="space-y-3 p-4 md:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brandColor }}>
                    {post.categoryName}
                  </span>
                  <h1 className="text-[clamp(1.6rem,4vw,2.9rem)] font-semibold leading-[1.2] text-foreground">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {showAuthor && authorName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{authorName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{readingTime} phút đọc</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{post.views.toLocaleString()} lượt xem</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          {post.excerpt && (
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="prose prose-slate prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-img:rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {commentsSection}
        </section>

        {relatedPosts.length > 0 && (
          <section className="container max-w-3xl mx-auto px-4 md:px-6 pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Bài viết liên quan</h2>
              <Link
                href="/posts"
                className="text-sm font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ color: brandColor }}
              >
                Xem thêm
              </Link>
            </div>
            <div className="space-y-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p._id}
                  href={`/posts/${p.slug}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardContent className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.thumbnail && !isBroken(p.thumbnail) ? (
                            <Image
                              src={p.thumbnail}
                              alt={p.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                              ref={(img) => {
                                if (img?.complete && img.naturalWidth === 0) {
                                  markBroken(p.thumbnail);
                                }
                              }}
                              onError={() =>{  markBroken(p.thumbnail); }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {p.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

type CommentsSectionProps = {
  brandColor: string;
  comments: CommentData[];
  commentName: string;
  commentEmail: string;
  commentContent: string;
  commentMessage: string | null;
  isSubmitting: boolean;
  showLikes: boolean;
  showReplies: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function CommentsSection({
  brandColor,
  comments,
  commentName,
  commentEmail,
  commentContent,
  commentMessage,
  isSubmitting,
  showLikes,
  showReplies,
  onNameChange,
  onEmailChange,
  onContentChange,
  onSubmit,
}: CommentsSectionProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-background/70 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">Bình luận</h3>
        <span className="text-xs text-muted-foreground">{comments.length} bình luận</span>
      </div>

      <div className="mt-4 space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="rounded-xl border border-border/40 bg-background p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{comment.authorName}</span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(comment._creationTime).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{comment.content}</p>
              {(showLikes || showReplies) && (
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {showLikes && (
                    <button type="button" className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      Thích
                    </button>
                  )}
                  {showReplies && (
                    <button type="button" className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Reply className="h-3.5 w-3.5" />
                      Trả lời
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            Chưa có bình luận nào. Hãy để lại bình luận đầu tiên.
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={commentName}
            onChange={(event) =>{  onNameChange(event.target.value); }}
            placeholder="Họ và tên"
            className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
            required
          />
          <input
            value={commentEmail}
            onChange={(event) =>{  onEmailChange(event.target.value); }}
            placeholder="Email (không bắt buộc)"
            className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
            type="email"
          />
        </div>
        <textarea
          value={commentContent}
          onChange={(event) =>{  onContentChange(event.target.value); }}
          placeholder="Nội dung bình luận..."
          className="min-h-[110px] w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          required
        />
        {commentMessage && (
          <p className="text-sm text-muted-foreground">{commentMessage}</p>
        )}
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: brandColor }} className="rounded-full text-white">
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </Button>
        </div>
      </form>
    </section>
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
