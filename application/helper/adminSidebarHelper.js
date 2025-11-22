
const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstractHelper'));

class AdminSidebarHelper extends AbstractHelper {

    render() {
        // Default posts data if none provided
        const defaultPosts = [
            {
                url: '/',
                title: 'Settings'
            },
            {
                url: '/',
                title: 'Posts'
            },
            {
                url: '/',
                title: 'Users'
            }
        ];

        const postsToRender = defaultPosts;

        let html = `
            <div class="col-sm-4 col-md-4">
                <div class="card admin-dashboard-card">
                    <h3 class="card-header">Admin</h3>
                    <ul class="list-group" id="recent-posts-list">`;

        // Render server-side posts as fallback
        postsToRender.forEach(post => {
            html += `
                        <li class="list-group-item clearfix odd">
                            <a href="/">${ post.title }</a>
                        </li>`;
        });

        html += `
                    </ul>
                </div>

            </div>`;

        return html;
    }
    
}

module.exports = AdminSidebarHelper;