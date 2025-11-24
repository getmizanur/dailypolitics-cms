# NewsArticle JSON-LD Helper

A view helper that generates JSON-LD structured data for NewsArticle schema to improve SEO.

## Overview

This helper creates [schema.org/NewsArticle](https://schema.org/NewsArticle) structured data in JSON-LD format. It helps search engines better understand your news content, which can improve search rankings and enable rich snippets in search results.

## Usage

### In Templates (Nunjucks)

```njk
{# Single post #}
{{ newsArticleJsonLd(post) | safe }}

{# Multiple posts (generates ItemList) #}
{{ newsArticleJsonLd(posts) | safe }}

{# With custom options #}
{{ newsArticleJsonLd(posts, {
    baseUrl: 'https://www.dailypolitics.com',
    publisherName: 'Daily Politics',
    publisherLogoUrl: 'https://example.com/logo.png'
}) | safe }}
```

### Example in Blog Index Template

```njk
{% extends 'layout/master.njk' %}

{% block head %}
    {# JSON-LD structured data for NewsArticles - improves SEO #}
    {% if posts and posts.length > 0 %}
        {{ newsArticleJsonLd(posts, { baseUrl: 'http://localhost:8080' }) | safe }}
    {% endif %}
{% endblock %}
```

## Parameters

### `data` (required)
- Type: `Object` or `Array`
- The post object(s) to generate JSON-LD for
- Can be a single post or array of posts

### `options` (optional)
- Type: `Object`
- Configuration options:
  - `baseUrl` (string) - Base URL for the site (default: 'http://localhost:8080')
  - `publisherName` (string) - Publisher name (default: 'Daily Politics')
  - `publisherLogoUrl` (string) - Publisher logo URL

## Post Object Fields

The helper uses the following fields from the post object:

### Required Fields
- `title` - Article headline
- `slug` - Article URL slug

### Optional Fields
- `content` - Article content (used for description and articleBody)
- `category_slug` - Category slug for URL construction
- `hero_image_url` - Hero image URL
- `hero_image_caption` - Image caption
- `published_at` - Publication date
- `updated_at` - Last modified date
- `author_name` - Author name
- `category_name` - Category name (used as articleSection)

## Output

### Single Post
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Article Title",
  "url": "http://localhost:8080/politics/articles/article-slug/index.html",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "http://localhost:8080/politics/articles/article-slug/index.html"
  },
  "description": "Article description...",
  "articleBody": "Full article content...",
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/image.jpg",
    "caption": "Image caption"
  },
  "datePublished": "2025-01-15T10:30:00.000Z",
  "dateModified": "2025-01-15T12:00:00.000Z",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Daily Politics",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dailypolitics-assets.s3-eu-west-1.amazonaws.com/img/daily-politics-logo.png"
    }
  },
  "articleSection": "Politics"
}
```

### Multiple Posts
When multiple posts are provided, they are wrapped in an ItemList:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": { /* NewsArticle schema */ }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": { /* NewsArticle schema */ }
    }
  ]
}
```

## Benefits

1. **Improved SEO** - Helps search engines understand your content better
2. **Rich Snippets** - Can enable rich results in Google Search
3. **Social Media** - Better content representation when shared
4. **News Aggregators** - Makes your content easier to discover and index

## Testing

Use Google's [Rich Results Test](https://search.google.com/test/rich-results) to validate your JSON-LD output.

## Related Files

- Helper: [newsArticleJsonLdHelper.js](newsArticleJsonLdHelper.js)
- Configuration: [application.config.js](../config/application.config.js)
- Template: [view/application/blog/index/index.njk](../../view/application/blog/index/index.njk)
