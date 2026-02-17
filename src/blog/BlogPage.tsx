import { useMemo, useEffect, useState } from 'react';
import { loadPublishedPosts } from './cms';
import type { BlogPost } from './types';
import { applySeo, applyBlogIndexJsonLd, applyBlogPostJsonLd } from '../seo';
import Navbar from '../components/Navbar';
import facebookIcon from '../assets/socialFacebook.svg';
import twitterIcon from '../assets/socialTwitter.svg';
import tiktokIcon from '../assets/socialTikTok.svg';

function formatDate(input: string) {
  return new Date(input).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderLinkedBrandText(text: string) {
  const brand = 'Ghost Job Checker';
  const parts = text.split(brand);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => (
    <span key={idx}>
      {part}
      {idx < parts.length - 1 && <a href="/">{brand}</a>}
    </span>
  ));
}

function renderParagraphText(text: string) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: Array<{ type: 'text' | 'link'; text: string; href?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const [full, label, href] = match;
    const start = match.index;
    if (start > lastIndex) {
      parts.push({ type: 'text', text: text.slice(lastIndex, start) });
    }
    parts.push({ type: 'link', text: label, href });
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return parts.map((part, idx) =>
    part.type === 'link' ? (
      <a key={`lnk-${idx}`} href={part.href} target="_blank" rel="noreferrer">
        {part.text}
      </a>
    ) : (
      <span key={`txt-${idx}`}>{renderLinkedBrandText(part.text)}</span>
    ),
  );
}

export default function BlogPage() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/blog';
  const slug = pathname.startsWith('/blog/') ? pathname.replace('/blog/', '') : '';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    let mounted = true;
    loadPublishedPosts().then((next) => {
      if (mounted) setPosts(next);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const post = useMemo(() => posts.find((p) => p.slug === slug) || null, [posts, slug]);

  useEffect(() => {
    if (!slug) {
      applySeo({
        title: 'Blog',
        description:
          'Ghost Job Checker blog covering ghost jobs, job search strategy, and hiring signal analysis.',
        path: '/blog',
      });
      applyBlogIndexJsonLd();
      return;
    }

    if (!post) {
      applySeo({
        title: 'Blog Post Not Found',
        description: 'The requested blog post was not found.',
        path: pathname,
      });
      return;
    }

    applySeo({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    });
    applyBlogPostJsonLd({
      title: post.title,
      description: post.description,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      author: post.author,
    });
  }, [pathname, post, slug]);

  if (!slug) {
    return (
      <>
        <Navbar
          isPaidRoute={false}
          isHomePage={false}
          accessCode={accessCode}
          onAccessCodeChange={setAccessCode}
          onAccessCodeSubmit={() => {}}
        />
        <main className="blog-page">
          <section className="blog-hero">
            <h1>Ghost Job Checker Blog</h1>
            <p>Release updates, hiring-signal breakdowns, and practical job search guidance.</p>
          </section>
          <section className="blog-list">
            {posts.map((item) => (
              <article className="blog-card" key={item.slug}>
                <p className="blog-card-meta">{formatDate(item.publishedAt)}</p>
                <h2>
                  <a href={`/blog/${item.slug}`}>{item.title}</a>
                </h2>
                <p>{item.description}</p>
              </article>
            ))}
            {posts.length === 0 && (
              <article className="blog-card">
                <h2>Posts Coming Soon</h2>
                <p>New articles will publish on a weekly schedule.</p>
              </article>
            )}
          </section>
        </main>
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-col">
              <div className="footer-brand">Ghost Job Checker</div>
              <p className="footer-note">All results are probability-based assessments using observable signals.</p>
              <div className="footer-socials">
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                  <img src={facebookIcon} alt="Facebook" />
                </a>
                <a href="https://www.x.com" target="_blank" rel="noreferrer">
                  <img src={twitterIcon} alt="Twitter" />
                </a>
                <a href="https://www.tiktok.com/en/" target="_blank" rel="noreferrer">
                  <img src={tiktokIcon} alt="TikTok" />
                </a>
              </div>
            </div>
            <div className="footer-col">
              <a href="/#hero">Home</a>
              <a href="/blog">Blog</a>
              <a href="/#hero">Run Free Check Now</a>
              <a href="/#pricing">Upgrade to Plus</a>
              <a href="/#pricing">Upgrade to Pro</a>
            </div>
            <div className="footer-col">
              <span>We aim to meet WCAG 2.1 AA guidelines.</span>
              <a href="/#terms">Terms of Service</a>
              <a href="/#refund">Refund Policy</a>
              <a href="/#privacy">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">© 2026 Ghost Job Checker</div>
        </footer>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar
          isPaidRoute={false}
          isHomePage={false}
          accessCode={accessCode}
          onAccessCodeChange={setAccessCode}
          onAccessCodeSubmit={() => {}}
        />
        <main className="blog-page">
          <section className="blog-hero">
            <h1>Post Not Found</h1>
            <p>
              The article you requested is unavailable. Visit the <a href="/blog">blog index</a>.
            </p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        isPaidRoute={false}
        isHomePage={false}
        accessCode={accessCode}
        onAccessCodeChange={setAccessCode}
        onAccessCodeSubmit={() => {}}
      />
      <main className="blog-page">
        <article className="blog-post">
          <a className="blog-back" href="/blog">
            Back to Blog
          </a>
          <h1>{post.title}</h1>
          <p className="blog-card-meta">
            {formatDate(post.publishedAt)} | {post.author.name}
          </p>
          {post.updatedAt && <p className="blog-card-meta">Last updated: {formatDate(post.updatedAt)}</p>}
          {post.content.map((block, idx) =>
            block.type === 'paragraph' ? (
              <p key={idx}>{renderParagraphText(block.text)}</p>
            ) : (
              <figure key={idx} className="blog-image">
                <img src={block.src} alt={block.alt} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            ),
          )}
          {!!post.methodology?.length && (
            <section className="blog-section">
              <h2>Methodology</h2>
              {post.methodology.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </section>
          )}
          {!!post.citations?.length && (
            <section className="blog-section">
              <h2>Citations</h2>
              {post.citations.map((citation) => (
                <p key={citation.url}>
                  <a href={citation.url} target="_blank" rel="noreferrer">
                    {citation.label}
                  </a>
                </p>
              ))}
            </section>
          )}
        </article>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-brand">Ghost Job Checker</div>
            <p className="footer-note">All results are probability-based assessments using observable signals.</p>
            <div className="footer-socials">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://www.x.com" target="_blank" rel="noreferrer">
                <img src={twitterIcon} alt="Twitter" />
              </a>
              <a href="https://www.tiktok.com/en/" target="_blank" rel="noreferrer">
                <img src={tiktokIcon} alt="TikTok" />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <a href="/#hero">Home</a>
            <a href="/blog">Blog</a>
            <a href="/#hero">Run Free Check Now</a>
            <a href="/#pricing">Upgrade to Plus</a>
            <a href="/#pricing">Upgrade to Pro</a>
          </div>
          <div className="footer-col">
            <span>We aim to meet WCAG 2.1 AA guidelines.</span>
            <a href="/#terms">Terms of Service</a>
            <a href="/#refund">Refund Policy</a>
            <a href="/#privacy">Privacy Policy</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Ghost Job Checker</div>
      </footer>
    </>
  );
}
