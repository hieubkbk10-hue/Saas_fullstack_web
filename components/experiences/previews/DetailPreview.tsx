import React from 'react';
import { ArrowLeft, Calendar, Check, ChevronRight, Clock, Eye, FileText, Home, Link as LinkIcon, Share2 } from 'lucide-react';
import Image from 'next/image';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

type PostDetailPreviewProps = {
  layoutStyle: DetailLayoutStyle;
  showAuthor: boolean;
  showRelated: boolean;
  showShare: boolean;
  showComments: boolean;
  device?: DeviceType;
  brandColor?: string;
};

const MOCK_POST = {
  title: 'Hướng dẫn sử dụng Next.js App Router trong dự án thực tế',
  categoryName: 'Technology',
  publishedAt: new Date('2026-01-15').getTime(),
  views: 1234,
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  excerpt: 'Next.js 14 ra mắt với nhiều cải tiến về performance và developer experience. Bài viết này sẽ hướng dẫn chi tiết cách sử dụng App Router trong dự án thực tế.',
  content: '<p>Next.js App Router là một trong những tính năng quan trọng nhất được giới thiệu trong phiên bản 13. Nó mang đến cách tổ chức routing hoàn toàn mới, linh hoạt và mạnh mẽ hơn.</p><p>Server Components cho phép rendering phía server một cách hiệu quả, giảm bundle size và cải thiện performance đáng kể.</p>',
};

const MOCK_RELATED = [
  { _id: '1', slug: 'post-1', title: 'React Server Components: Tương lai của React', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', publishedAt: new Date('2026-01-10').getTime() },
  { _id: '2', slug: 'post-2', title: 'TypeScript Best Practices cho Next.js', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', publishedAt: new Date('2026-01-08').getTime() },
  { _id: '3', slug: 'post-3', title: 'Tối ưu performance với Image Optimization', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', publishedAt: new Date('2026-01-05').getTime() },
];

// Classic Style Preview - Extracted from ClassicStyle
function ClassicStylePreview({ showAuthor, showRelated, showShare, brandColor = '#3b82f6' }: Omit<PostDetailPreviewProps, 'layoutStyle' | 'device'>) {
  const readingTime = 5;
  const [isCopied] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-300"
        style={{ backgroundColor: brandColor, width: '45%' }}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
              </div>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>
              <div className="hover:text-foreground transition-colors">Bài viết</div>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
              {MOCK_POST.title}
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
                  {MOCK_POST.categoryName}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                {MOCK_POST.title}
              </h1>

              {showAuthor && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(MOCK_POST.publishedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} phút đọc</span>
                  </div>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{MOCK_POST.views.toLocaleString()} lượt xem</span>
                  </div>
                </div>
              )}
            </header>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/60 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              {MOCK_POST.thumbnail ? (
                <Image
                  src={MOCK_POST.thumbnail}
                  alt={MOCK_POST.title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText size={48} className="text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div className="prose prose-zinc prose-lg max-w-none lg:max-w-[640px] dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: MOCK_POST.content }} />
            </div>

            <div className="border-t pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Tất cả bài viết
                </div>
              </div>

              {showShare && (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full sm:w-auto min-w-[140px]"
                    style={{ backgroundColor: isCopied ? `${brandColor}15` : brandColor, color: isCopied ? brandColor : '#fff' }}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {isCopied ? 'Đã copy link' : 'Chia sẻ'}
                  </button>
                </div>
              )}
            </div>
          </article>

          {showRelated && MOCK_RELATED.length > 0 && (
            <aside className="lg:col-span-3 space-y-6">
              <div className="h-fit sticky top-24 rounded-lg bg-muted/30">
                <div className="flex flex-col space-y-1.5 p-6 px-0 sm:px-6">
                  <h3 className="text-base font-semibold">Bài viết liên quan</h3>
                </div>
                <div className="p-6 pt-0 px-0 sm:px-6 gap-3 flex flex-col">
                  {MOCK_RELATED.map((p) => (
                    <div key={p._id} className="group flex gap-3 items-start">
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted/60">
                        {p.thumbnail ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText size={20} className="text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-80 transition-colors">
                          {p.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.publishedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

// Modern Style Preview - Extracted from ModernStyle
function ModernStylePreview({ showAuthor, showRelated, showShare, brandColor = '#3b82f6' }: Omit<PostDetailPreviewProps, 'layoutStyle' | 'device'>) {
  const readingTime = 5;
  const [isCopied] = React.useState(false);

  return (
    <div className="min-h-screen bg-background pb-12 selection:bg-accent/30">
      <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-8 md:space-y-12">
        <div className="flex flex-col gap-4">
          <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <div className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Home className="h-4 w-4" />
                </div>
              </li>
              <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
              <li>
                <div className="hover:text-foreground transition-colors">Bài viết</div>
              </li>
              <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
              <li className="font-medium text-foreground truncate max-w-[200px] md:max-w-[360px]">
                {MOCK_POST.title}
              </li>
            </ol>
            {showShare && (
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-input bg-background px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Copy link"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                {isCopied ? 'Đã copy' : 'Copy link'}
              </button>
            )}
          </nav>

          <section className="max-w-7xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${brandColor}10`, borderColor: `${brandColor}25`, color: brandColor }}
              >
                {MOCK_POST.categoryName}
              </span>
            </div>

            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-tight text-foreground leading-[1.2] text-balance">
              {MOCK_POST.title}
            </h1>

            {showAuthor && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time className="font-medium">{new Date(MOCK_POST.publishedAt).toLocaleDateString('vi-VN')}</time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{readingTime} phút đọc</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">{MOCK_POST.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="relative overflow-hidden rounded-2xl bg-muted aspect-[16/9] md:aspect-[21/9] max-w-7xl mx-auto">
          {MOCK_POST.thumbnail ? (
            <Image
              src={MOCK_POST.thumbnail}
              alt={MOCK_POST.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={56} className="text-muted-foreground/40" />
            </div>
          )}
        </section>

        <article className="max-w-7xl mx-auto space-y-6">
          {MOCK_POST.excerpt && (
            <p
              className="text-[clamp(1.125rem,2vw,1.5rem)] leading-relaxed text-foreground/90 font-medium border-l-4 pl-4"
              style={{ borderColor: brandColor }}
            >
              {MOCK_POST.excerpt}
            </p>
          )}

          <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-loose">
            <div dangerouslySetInnerHTML={{ __html: MOCK_POST.content }} />
          </div>
        </article>

        {showRelated && MOCK_RELATED.length > 0 && (
          <section className="pt-6 pb-2">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Bài viết cùng chủ đề</h2>
                <div className="text-sm font-medium" style={{ color: brandColor }}>
                  Xem thêm
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_RELATED.map((p) => (
                  <div
                    key={p._id}
                    className="group rounded-lg border bg-background p-4 shadow-sm transition-colors duration-200 flex flex-col"
                    style={{ borderColor: `${brandColor}25` }}
                  >
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted mb-3 relative">
                      {p.thumbnail ? (
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText size={28} className="text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(p.publishedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span
                      className="mt-auto pt-3 self-end inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: brandColor }}
                    >
                      Xem ngay
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Minimal Style Preview - Extracted from MinimalStyle
function MinimalStylePreview({ showAuthor, showRelated, showShare, brandColor = '#3b82f6' }: Omit<PostDetailPreviewProps, 'layoutStyle' | 'device'>) {
  const [isCopied] = React.useState(false);
  const readingTime = 5;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-16">
        <section className="relative w-full overflow-hidden bg-muted">
          <div className="relative h-[clamp(220px,45vh,520px)] w-full">
            {MOCK_POST.thumbnail ? (
              <Image
                src={MOCK_POST.thumbnail}
                alt={MOCK_POST.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText size={56} className="text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 z-10">
              <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between pt-4">
                  <div className="group inline-flex h-11 items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    Danh sách
                  </div>

                  {showShare && (
                    <button
                      type="button"
                      className="h-11 w-11 inline-flex items-center justify-center border-white/30 bg-white/15 text-white hover:bg-white/20 rounded-md"
                      aria-label="Chia sẻ"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="container max-w-6xl mx-auto h-full px-4 md:px-6 flex items-end pb-6 md:pb-8">
              <div className="w-full max-w-3xl border-border/70 bg-background/90 shadow-sm backdrop-blur-sm rounded-lg">
                <div className="space-y-3 p-4 md:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brandColor }}>
                    {MOCK_POST.categoryName}
                  </span>
                  <h1 className="text-[clamp(1.6rem,4vw,2.9rem)] font-semibold leading-[1.2] text-foreground">
                    {MOCK_POST.title}
                  </h1>
                  {showAuthor && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time>{new Date(MOCK_POST.publishedAt).toLocaleDateString('vi-VN')}</time>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{readingTime} phút đọc</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{MOCK_POST.views.toLocaleString()} lượt xem</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          {MOCK_POST.excerpt && (
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground leading-relaxed">
              {MOCK_POST.excerpt}
            </p>
          )}
          <div className="prose prose-slate prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-img:rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: MOCK_POST.content }} />
          </div>
        </section>

        {showRelated && MOCK_RELATED.length > 0 && (
          <section className="container max-w-3xl mx-auto px-4 md:px-6 pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Bài viết liên quan</h2>
              <div
                className="text-sm font-semibold transition-colors hover:text-foreground"
                style={{ color: brandColor }}
              >
                Xem thêm
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_RELATED.map((p) => (
                <div
                  key={p._id}
                  className="block rounded-lg"
                >
                  <div className="transition-colors hover:bg-muted/40 border rounded-lg">
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.thumbnail ? (
                            <Image
                              src={p.thumbnail}
                              alt={p.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FileText size={20} className="text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                            {p.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(p.publishedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Main Preview Component
export function PostDetailPreview({
  layoutStyle,
  showAuthor,
  showRelated,
  showShare,
  showComments,
  device = 'desktop',
  brandColor = '#3b82f6',
}: PostDetailPreviewProps) {
  const props = { showAuthor, showRelated, showShare, showComments, brandColor, device };

  return (
    <div className="w-full">
      {layoutStyle === 'classic' && <ClassicStylePreview {...props} />}
      {layoutStyle === 'modern' && <ModernStylePreview {...props} />}
      {layoutStyle === 'minimal' && <MinimalStylePreview {...props} />}
    </div>
  );
}

export function ServiceDetailPreview(props: PostDetailPreviewProps) {
  return <PostDetailPreview {...props} />;
}
