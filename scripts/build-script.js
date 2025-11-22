#!/usr/bin/env node

/**
 * Static Site Generator for Daily Politics CMS
 *
 * Generates static HTML files into public-static/ directory:
 * - Home listing with pagination (/, /page/2/, /page/3/, ...)
 * - Article pages (/{category_slug}/articles/{slug}/index.html)
 *
 * Usage: node scripts/build-script.js
 */

const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const CONFIG = {
    outputDir: path.join(__dirname, '../static-site'),
    pageSize: 2,
    viewPath: path.join(__dirname, '../view')
};

// Setup global applicationPath helper
global.applicationPath = (relativePath) => {
    return path.join(__dirname, '..', relativePath);
};

/**
 * Initialize Nunjucks environment with view helpers
 */
function initNunjucks() {
    const env = nunjucks.configure([CONFIG.viewPath], {
        autoescape: false,
        watch: false,
        nocache: true
    });

    // Add date filter
    const dateFilter = require('nunjucks-date-filter');
    env.addFilter('date', dateFilter);

    // Load application config to register view helpers
    const appConfig = require(global.applicationPath('/application/config/application.config'));
    const ViewHelperManager = require(global.applicationPath('/library/mvc/view/view-helper-manager'));

    const viewHelperManager = new ViewHelperManager();
    const applicationHelpers = appConfig.view_helpers?.invokables || {};
    const allHelpers = viewHelperManager.getAllHelpers(applicationHelpers);

    // Register all view helpers
    Object.entries(allHelpers).forEach(([helperName, helperConfig]) => {
        env.addGlobal(helperName, function(...args) {
            const helperPath = typeof helperConfig === 'string' ? helperConfig : helperConfig.class;
            const ViewHelper = require(global.applicationPath(helperPath));
            const helperInstance = new ViewHelper();
            return helperInstance.render(...args);
        });
    });

    return env;
}

/**
 * Calculate relative path to root based on file depth
 */
function getRelativePathToRoot(filePath) {
    // Count directory depth (number of slashes in path)
    const depth = filePath.split('/').length - 1;

    if (depth === 0) {
        return './'; // Root level (index.html)
    }

    return '../'.repeat(depth);
}

/**
 * Convert absolute paths to relative paths for static hosting
 */
function convertToRelativePaths(html, filePath) {
    const relativeRoot = getRelativePathToRoot(filePath);

    // Replace absolute paths with relative paths for assets
    html = html.replace(/href="\/css\//g, `href="${relativeRoot}css/`);
    html = html.replace(/src="\/js\//g, `src="${relativeRoot}js/`);
    html = html.replace(/src="\/images\//g, `src="${relativeRoot}images/`);
    html = html.replace(/src="\/api\//g, `src="${relativeRoot}api/`);
    html = html.replace(/href="\/api\//g, `href="${relativeRoot}api/`);

    // Handle pagination links with query strings (?page=N)
    html = html.replace(/href="[^"]*?\?page=(\d+)"/g, (_match, pageNum) => {
        return `href="${relativeRoot}page/${pageNum}/index.html"`;
    });

    // Fix navigation links (but keep external links untouched)
    html = html.replace(/href="\/([^"?]*?)"/g, (_match, path) => {
        // Skip if it's already been converted or is external
        if (path.startsWith('http') || path.startsWith('#') || path.startsWith('../') || path.startsWith('./')) {
            return _match;
        }

        // Convert to relative path
        if (path === '' || path === '/') {
            return `href="${relativeRoot}index.html"`;
        }

        // If path already ends with index.html, don't add it again
        if (path.endsWith('index.html')) {
            return `href="${relativeRoot}${path}"`;
        }

        // Article links and other paths - just add index.html at the end
        return `href="${relativeRoot}${path}/index.html"`;
    });

    // Inject recent-posts-loader.js script before closing </footer> tag
    const recentPostsScript = `<script src="${relativeRoot}js/recent-posts-loader.js"></script>`;
    html = html.replace(/(<footer>[\s\S]*?<!-- Scripts -->)/i, `$1\n        ${recentPostsScript}`);

    return html;
}

/**
 * Write HTML file to output directory
 */
async function writeHtmlFile(filePath, content) {
    const fullPath = path.join(CONFIG.outputDir, filePath);
    const dir = path.dirname(fullPath);

    // Convert absolute paths to relative paths
    content = convertToRelativePaths(content, filePath);

    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf8');
    console.log(`✓ Generated: ${filePath}`);
}

/**
 * Fetch post data from the database
 */
async function fetchPostData() {
    try {
        const PostService = require(global.applicationPath('/application/service/post-service'));
        const postService = new PostService();

        // Get all published posts
        const posts = await postService.getAllPublishedPosts();
        const totalPosts = posts.length;

        // Close database connection
        await postService.closeConnection();

        return { posts, totalPosts };
    } catch (error) {
        console.error('Error fetching post data:', error);
        throw error;
    }
}

/**
 * Fetch recent posts for sidebar
 */
async function fetchRecentPosts() {
    try {
        const PostService = require(global.applicationPath('/application/service/post-service'));
        const postService = new PostService();

        const recentPosts = await postService.getRecentPostsForSidebar();

        await postService.closeConnection();

        return recentPosts;
    } catch (error) {
        console.error('Error fetching recent posts:', error);
        return [];
    }
}

/**
 * Generate home listing pages with pagination
 */
async function generateHomePages(env, posts, totalPosts, recentPosts) {
    const totalPages = Math.ceil(totalPosts / CONFIG.pageSize);

    console.log(`\n📄 Generating home pages (${totalPages} pages)...`);

    for (let page = 1; page <= totalPages; page++) {
        try {
            // Get posts for this page
            const startIndex = (page - 1) * CONFIG.pageSize;
            const endIndex = startIndex + CONFIG.pageSize;
            const pagePosts = posts.slice(startIndex, endIndex);

            // Build pagination data
            const pagination = {
                totalPages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                baseUrl: ''
            };

            // Render template
            const templateData = {
                pageTitle: page === 1 ? 'Daily Politics CMS' : `Daily Politics CMS - Page ${page}`,
                posts: pagePosts,
                recentPosts: recentPosts,
                pagination: pagination,
                request: {
                    url: page === 1 ? 'http://localhost:8080/' : `http://localhost:8080/?page=${page}`
                }
            };

            const html = env.render('application/blog/index/index.njk', templateData);

            // Write file
            const filePath = page === 1 ? 'index.html' : `page/${page}/index.html`;
            await writeHtmlFile(filePath, html);
        } catch (error) {
            console.error(`✗ Failed to generate page ${page}:`, error.message);
        }
    }
}

/**
 * Generate individual article pages
 */
async function generateArticlePages(env, posts, recentPosts) {
    console.log(`\n📄 Generating article pages (${posts.length} articles)...`);

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        try {
            const PostService = require(global.applicationPath('/application/service/post-service'));
            const postService = new PostService();

            // Get prev/next articles
            const nextArticle = await postService.getNextArticle(post.published_at, post.id);
            const prevArticle = await postService.getPreviousArticle(post.published_at, post.id);

            await postService.closeConnection();

            const categorySlug = post.category_slug || 'general';

            // Render template
            const templateData = {
                pageTitle: post.title,
                post: post,
                recentPosts: recentPosts,
                nextArticle: nextArticle,
                prevArticle: prevArticle,
                request: {
                    url: `http://localhost:8080/${categorySlug}/articles/${post.slug}`
                }
            };

            const html = env.render('application/blog/index/view.njk', templateData);

            // Write file
            const filePath = `${categorySlug}/articles/${post.slug}/index.html`;
            await writeHtmlFile(filePath, html);
        } catch (error) {
            console.error(`✗ Failed to generate article ${post.slug}:`, error.message);
        }
    }
}

/**
 * Generate recent-posts.json API file
 */
async function generateRecentPostsJson(recentPosts) {
    console.log('\n📄 Generating recent-posts.json API...');

    try {
        // Format posts for JSON (only needed fields)
        const jsonPosts = recentPosts.map(post => ({
            title: post.title,
            slug: post.slug,
            category_slug: (post.category_slug || 'general')
        }));

        const jsonContent = JSON.stringify(jsonPosts, null, 2);

        // Write to static-site/api/recent-posts.json
        const staticApiDir = path.join(CONFIG.outputDir, 'api');
        await fs.mkdir(staticApiDir, { recursive: true });
        const staticJsonPath = path.join(staticApiDir, 'recent-posts.json');
        await fs.writeFile(staticJsonPath, jsonContent, 'utf8');
        console.log(`✓ Generated: api/recent-posts.json (${jsonPosts.length} posts)`);
    } catch (error) {
        console.error('✗ Failed to generate recent-posts.json:', error.message);
    }
}

/**
 * Copy static assets (CSS, JS, images)
 */
async function copyStaticAssets() {
    console.log('\n📦 Copying static assets...');

    const assetDirs = ['css', 'js', 'images'];

    for (const dir of assetDirs) {
        const sourcePath = path.join(__dirname, '../public', dir);
        const targetPath = path.join(CONFIG.outputDir, dir);

        try {
            // Check if source exists
            await fs.access(sourcePath);

            // Copy directory recursively
            await copyDirectory(sourcePath, targetPath);
            console.log(`✓ Copied: ${dir}/`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`✗ Failed to copy ${dir}/:`, error.message);
            }
        }
    }
}

/**
 * Recursively copy directory
 */
async function copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Clean output directory
 */
async function cleanOutputDirectory() {
    console.log('\n🧹 Cleaning output directory...');

    try {
        await fs.rm(CONFIG.outputDir, { recursive: true, force: true });
        await fs.mkdir(CONFIG.outputDir, { recursive: true });
        console.log('✓ Output directory cleaned');
    } catch (error) {
        console.error('✗ Failed to clean output directory:', error.message);
    }
}

/**
 * Generate build summary
 */
function generateSummary(startTime, totalPosts) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalPages = Math.ceil(totalPosts / CONFIG.pageSize);
    const totalFiles = totalPages + totalPosts;

    console.log('\n' + '='.repeat(50));
    console.log('✅ Build Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Statistics:`);
    console.log(`   • Home pages: ${totalPages}`);
    console.log(`   • Article pages: ${totalPosts}`);
    console.log(`   • Total HTML files: ${totalFiles}`);
    console.log(`   • Build time: ${duration}s`);
    console.log(`   • Output directory: ${CONFIG.outputDir}`);
    console.log('='.repeat(50));
}

/**
 * Main build function
 */
async function build() {
    const startTime = Date.now();

    console.log('🚀 Starting static site generation...');
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
    console.log(`📄 Page size: ${CONFIG.pageSize} posts per page\n`);

    try {
        // Step 1: Clean output directory
        await cleanOutputDirectory();

        // Step 2: Initialize Nunjucks
        console.log('⚙️  Initializing template engine...');
        const env = initNunjucks();
        console.log('✓ Template engine initialized');

        // Step 3: Fetch post data
        console.log('\n📚 Fetching post data...');
        const { posts, totalPosts } = await fetchPostData();
        console.log(`✓ Found ${totalPosts} published posts`);

        // Step 4: Fetch recent posts for sidebar
        console.log('📚 Fetching recent posts for sidebar...');
        const recentPosts = await fetchRecentPosts();
        console.log(`✓ Found ${recentPosts.length} recent posts`);

        // Step 5: Generate home pages
        await generateHomePages(env, posts, totalPosts, recentPosts);

        // Step 6: Generate article pages
        await generateArticlePages(env, posts, recentPosts);

        // Step 7: Generate recent-posts.json API
        await generateRecentPostsJson(recentPosts);

        // Step 8: Copy static assets
        await copyStaticAssets();

        // Step 9: Generate summary
        generateSummary(startTime, totalPosts);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Build failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the build
build();
