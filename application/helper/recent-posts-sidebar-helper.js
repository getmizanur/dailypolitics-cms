
const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

class RecentPostsSidebarHelper extends AbstractHelper {

    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [posts = null] = cleanArgs;

        // Default posts data if none provided
        const defaultPosts = [
            {
                url: '/',
                title: 'Welcome to Dailypolitics'
            }
        ];

        const postsToRender = posts || defaultPosts;

        let html = `
        <div class="col-sm-4 col-md-4 hidden-phone">
            <div class="dailypolitics-!-margin-top-8">
                <div class="card">
                    <h1 class="dailypolitics-heading-xl post-header" style="background-color: rgba(0,0,0,.03)">Recent Posts</h3>
                    <ul class="list-group" id="recent-posts-list">`;

        // Render server-side posts as fallback
        postsToRender.forEach(post => {
            html += `
                        <li class="list-group-item clearfix odd">
                            <a href="/${post.category_slug || 'general'}/articles/${post.slug || '#'}/index.html">${post.title}</a>
                        </li>`;
        });

        html += `
                    </ul>
                </div>
            </div>
        </div>`;

        return html;
    }
    
}

module.exports = RecentPostsSidebarHelper;