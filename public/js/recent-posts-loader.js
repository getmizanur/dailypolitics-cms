/**
 * Recent Posts Loader
 * Loads recent posts from JSON file and updates the sidebar list
 */
(function() {
    'use strict';

    /**
     * Load recent posts from JSON file
     */
    function loadRecentPosts() {
        const listElement = document.getElementById('recent-posts-list');

        if (!listElement) {
            console.warn('Recent posts list element not found');
            return;
        }

        // Fetch the JSON file
        fetch('/assets/json/recent-posts.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load recent posts: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                // Clear existing items
                listElement.innerHTML = '';

                // Check if data is an array
                if (!Array.isArray(data)) {
                    console.error('Invalid data format: expected an array');
                    return;
                }

                // Render each post
                data.forEach(function(post) {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item clearfix odd';

                    const link = document.createElement('a');
                    link.href = '/' + (post.category_slug || 'general') + '/articles/' + (post.slug || '#');
                    link.textContent = post.title || 'Untitled';

                    listItem.appendChild(link);
                    listElement.appendChild(listItem);
                });
            })
            .catch(function(error) {
                console.error('Error loading recent posts:', error);
                // Keep the server-rendered posts as fallback
            });
    }

    // Load posts when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadRecentPosts);
    } else {
        loadRecentPosts();
    }
})();
