
const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

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
        <div class="col-sm-4 col-md-4 hidden-phone" style="padding-left: 0px !important;">
            <div class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
                <div class="card">
                    <h3 class="card-header">Recent Posts</h3>
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