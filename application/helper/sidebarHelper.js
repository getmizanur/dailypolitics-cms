
const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

class SidebarHelper extends AbstractHelper {

    render(posts = null) {
        // Default posts data if none provided
        const defaultPosts = [
            {
                url: '/',
                title: 'Welcome to Dailypolitics'
            }
        ];

        const postsToRender = posts || defaultPosts;

        let html = `
        <div class="col-sm-4 hidden-phone" style="padding-left: 0px !important;">
            <div class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
                <div class="card">
                    <h3 class="card-header">Recent Posts</h3>
                    <ul class="list-group">`;

        postsToRender.forEach(post => {
            html += `
                        <li class="list-group-item clearfix odd">
                            <a href="/${post.category_slug || 'general'}/articles/${post.slug || '#'}">${post.title}</a>
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

module.exports = SidebarHelper;