# Blog CMS Workflow

## Goals
- Blog lives at `https://ghostjobs.trusted-tools.com/blog`
- Posts support text + images
- Publishing is scheduled weekly (Monday, 8:00 AM Pacific)
- No personal byline required

## CMS Contract
Set `VITE_BLOG_FEED_URL` to an endpoint that returns an array of posts:

```json
[
  {
    "slug": "example-post",
    "title": "Example Title",
    "description": "Short summary",
    "publishedAt": "2026-03-02T16:00:00.000Z",
    "updatedAt": "2026-03-05T19:00:00.000Z",
    "authorName": "Ghost Jobs Editorial Team",
    "authorRole": "Editorial",
    "authorType": "Organization",
    "tags": ["ghost jobs"],
    "content": [
      { "type": "paragraph", "text": "Body text..." },
      { "type": "image", "src": "https://cdn.example.com/post-1.jpg", "alt": "Chart", "caption": "Q1 data" }
    ],
    "methodology": ["How the data was collected..."],
    "citations": [{ "label": "BLS Report", "url": "https://example.com/report" }]
  }
]
```

Only posts whose `publishedAt` is in the past are rendered.

## Monday 8 AM Pacific Scheduling
In your CMS:
1. Create 24 draft posts.
2. Set each post `publishedAt` to Monday at `8:00 AM` in `America/Los_Angeles`.
3. Configure CMS scheduled publish using that field.
4. Trigger a deploy webhook on publish.

At build time, run with `BLOG_FEED_URL` set so the sitemap includes newly published posts:

```bash
BLOG_FEED_URL="https://your-cms.example.com/api/blog-feed" npm run build
```

## No Personal Name Requirement
Use:
- `authorName`: `Ghost Jobs Editorial Team`
- `authorType`: `Organization`

This supports EEAT-style transparency without exposing personal identity.
