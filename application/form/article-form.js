const Form = require(
    global.applicationPath('/library/form/form'));
const Hidden = require(
    global.applicationPath('/library/form/element/hidden'));
const Text = require(
    global.applicationPath('/library/form/element/text'));
const Textarea = require(
    global.applicationPath('/library/form/element/textarea'));
const Select = require(
    global.applicationPath('/library/form/element/select'));
const Checkbox = require(
    global.applicationPath('/library/form/element/checkbox'));
const Submit = require(
    global.applicationPath('/library/form/element/submit'));
const Csrf = require(
    global.applicationPath('/library/form/element/csrf'));

/**
 * ArticleForm - Form for creating and editing articles
 */
class ArticleForm extends Form {
    constructor(options = {}) {
        super(options);
    }

    /**
     * Add ID field (hidden)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addIdField(name = 'id') {
        const element = new Hidden(name);
        element.setAttributes({
            'id': 'article-id'
        });
        this.add(element);
        return this;
    }

    /**
     * Add slug field (text, disabled)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addSlugField(name = 'slug') {
        const element = new Text(name);
        element.setLabel('Slug');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-slug',
            'readonly': 'readonly',
            'placeholder': 'article-slug-auto-generated'
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add title field (text)
     * @param {string} name
     * @param {Object} additionalAttributes - Optional additional HTML
     *                                         attributes
     * @returns {ArticleForm}
     */
    addTitleField(name = 'title', additionalAttributes = {}) {
        const element = new Text(name);
        element.setLabel('Title');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-title',
            'placeholder': 'Enter article title',
            //'required': 'required'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add excerpt field (textarea)
     * @param {string} name
     * @param {Object} additionalAttributes - Optional additional HTML
     *                                         attributes
     * @returns {ArticleForm}
     */
    addExcerptField(name = 'excerpt_markdown',
                    additionalAttributes = {}) {
        const element = new Textarea(name);
        element.setLabel('Excerpt');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-excerpt',
            'rows': '4',
            'placeholder': 'Enter a brief excerpt or summary',
            //'maxlength': '500'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add content field (textarea)
     * @param {string} name
     * @param {Object} additionalAttributes - Optional additional HTML
     *                                         attributes
     * @returns {ArticleForm}
     */
    addContentField(name = 'content_markdown',
                    additionalAttributes = {}) {
        const element = new Textarea(name);
        element.setLabel('Content');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-content',
            'rows': '15',
            'placeholder': 'Enter article content',
            //'required': 'required'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add author_id field (hidden)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addAuthorIdField(name = 'author_id') {
        const element = new Hidden(name);
        element.setAttributes({
            'id': 'article-author-id'
        });
        this.add(element);
        return this;
    }

    /**
     * Add author_name field (text, disabled)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addAuthorNameField(name = 'author_name',
                       additionalAttributes = {}) {
        const element = new Text(name);
        element.setLabel('Author');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-author-name',
            'disabled': 'disabled',
            'placeholder': 'Author name',
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add category dropdown (select)
     * @param {string} name
     * @param {Array|Object} categories - Category options
     * @returns {ArticleForm}
     */
    addCategoryField(name = 'category_id', categories = [],
                     additionalAttributes = {}) {
        const element = new Select(name);
        element.setLabel('Category');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-category',
            //'required': 'required'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');

        // Set empty option as placeholder
        element.setEmptyOption('-- Select a category --', '');

        // Set category options
        // Expected format: [{id: 1, name: 'Politics'}, ...]
        // or {1: 'Politics', ...}
        if (Array.isArray(categories)) {
            const options = categories.map(cat => ({
                value: cat.id || cat.value,
                label: cat.name || cat.label || cat.category_name
            }));
            element.setOptions(options);
        } else {
            element.setOptions(categories);
        }

        this.add(element);
        return this;
    }

    /**
     * Add meta_description field (textarea)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addMetaDescriptionField(name = 'meta_description',
                            additionalAttributes = {}) {
        const element = new Textarea(name);
        element.setLabel('Meta description');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'article-meta-description',
            'rows': '3',
            'placeholder':
                'Enter SEO meta description ' +
                '(recommended: 150-160 characters)',
            //'maxlength': '160'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add comment_enabled field (checkbox)
     * @param {string} name
     * @returns {ArticleForm}
     */
    addCommentEnabledField(name = 'comments_enabled',
                           additionalAttributes = {}) {
        const element = new Checkbox(name);
        element.setLabel('Enable comments');
        element.setAttributes({
            'class': 'dp-checkbox',
            'id': 'article-comment-enabled',
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');

        // Set checked and unchecked values
        element.setCheckedValue('1');
        element.setUncheckedValue('0');

        this.add(element);
        return this;
    }

    /**
     * Add excerpt field (textarea)
     * @param {string} name
     * @param {Object} additionalAttributes - Optional additional HTML
     *                                         attributes
     * @returns {ArticleForm}
     */
    addChangeReasonField(name = 'change_reason',
                    additionalAttributes = {}) {
        const element = new Textarea(name);
        element.setLabel('Reason for change');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'change_reason',
            'rows': '4',
            'placeholder': 'Please give a brief reason for this change',
            //'maxlength': '500'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add change reason field (textarea)
     * Used in revision drafts to document the reason for changes
     * Helps track editorial history and provides context for updates
     * @param {string} name - Field name (default: 'change_reason')
     * @param {Object} additionalAttributes - Optional additional HTML
     *                                         attributes
     * @returns {ArticleForm}
     */
    addChangeReasonField(name = 'change_reason',
                    additionalAttributes = {}) {
        const element = new Textarea(name);
        element.setLabel('Reason For Change');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'change-reason',
            'rows': '15',
            'placeholder': 'Please enter a change reason for this revision',
            //'required': 'required'
            ...additionalAttributes
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
        return this;
    }

    /**
     * Add a submit button with auto-generated style class
     * @param {string} name - Button name (e.g., 'delete', 'publish',
     *                        'submit', 'review_requested')
     * @param {string} label - Button label text
     * @param {string} [styleClass] - Optional custom style class.
     *                                If not provided, auto-generates
     *                                from name
     * @returns {ArticleForm}
     */
    addSubmitButton(name, label, styleClass = null) {
        const element = new Submit(name);
        element.setValue(label);

        // Auto-generate style class from button name if not provided
        // Examples: 'delete' -> 'dp-button--delete',
        // 'review_requested' -> 'dp-button--review-requested'
        const generatedClass = styleClass ||
            `dp-button--${name.replace(/_/g, '-')}`;

        element.setAttributes({
            'class': `dp-button ${generatedClass}`
        });
        this.add(element);
        return this;
    }

    /**
     * Add save revision draft button
     * Saves changes to an existing revision draft without publishing
     * @param {string} name - Button name
     *                        (default: 'save_revision_draft')
     * @param {string} label - Button label text
     *                         (default: 'Save Revision Draft')
     * @returns {ArticleForm}
     */
    addExitThisPageButton(name = 'exit_this_page',
                               label = 'Exit this page') {
        return this.addSubmitButton(name, label,
            'dp-button--exit_this_page');
    }

    /**
     * Add save revision draft button
     * Saves changes to an existing revision draft without publishing
     * @param {string} name - Button name
     *                        (default: 'save_revision_draft')
     * @param {string} label - Button label text
     *                         (default: 'Save Revision Draft')
     * @returns {ArticleForm}
     */
    addSaveRevisionDraftButton(name = 'save_revision_draft',
                               label = 'Save revision draft') {
        return this.addSubmitButton(name, label,
            'dp-button--save_revision_draft');
    }

    /**
     * Add publish revision button
     * Publishes a revision draft, making it the live version of the post
     * @param {string} name - Button name (default: 'publish_revision')
     * @param {string} label - Button label text
     *                         (default: 'Publish Revision')
     * @returns {ArticleForm}
     */
    addPublishRevisionButton(name = 'publish_revision',
                             label = 'Publish revision') {
        return this.addSubmitButton(name, label,
            'dp-button--publish_revision');
    }

    /**
     * Add delete draft button
     * Permanently deletes a revision draft
     * @param {string} name - Button name (default: 'delete_draft')
     * @param {string} label - Button label text (default: 'Delete Draft')
     * @returns {ArticleForm}
     */
    addDeleteDraftButton(name = 'delete_draft',
                         label = 'Delete draft') {
        return this.addSubmitButton(name, label,
            'dp-button--delete_draft');
    }

    /**
     * Add continue revision draft button
     * Redirects to the revision editing page to continue working on an
     * existing draft
     * @param {string} name - Button name
     *                        (default: 'continue_revision_draft')
     * @param {string} label - Button label text
     *                         (default: 'Continue Revision Draft')
     * @returns {ArticleForm}
     */
    addContinueRevisionDraftButton(name = 'continue_revision_draft',
                                   label = 'Continue revision draft') {
        return this.addSubmitButton(name, label,
            'dp-button--continue_revision_draft');
    }

    /**
     * Add unpublish button
     * Changes post status from 'published' to 'draft', removing it from
     * public view
     * @param {string} name - Button name (default: 'unpublish')
     * @param {string} label - Button label text (default: 'Unpublish')
     * @returns {ArticleForm}
     */
    addUnpublishButton(name = 'unpublish', label = 'Unpublish') {
        return this.addSubmitButton(name, label, 'dp-button--unpublish');
    }

    /**
     * Add create revision draft button
     * Creates a new revision draft for making changes to a published post
     * Uses yellow background styling (dp-button--revision_draft)
     * @param {string} name - Button name
     *                        (default: 'create_revision_draft')
     * @param {string} label - Button label text
     *                         (default: 'Create Revision Draft')
     * @returns {ArticleForm}
     */
    addCreateRevisionDraftButton(name = "create_revision_draft",
                                 label = "Create revision draft") {
        return this.addSubmitButton(name, label,
            "dp-button--revision_draft");
    }

    /**
     * Add delete button
     * Permanently deletes the post (soft delete by setting deleted_at
     * timestamp)
     * Uses red background styling (dp-button--delete)
     * @param {string} name - Button name (default: 'delete')
     * @param {string} label - Button label text (default: 'Delete')
     * @returns {ArticleForm}
     */
    addDeleteButton(name = 'delete', label = 'Delete') {
        return this.addSubmitButton(name, label, 'dp-button--delete');
    }

    /**
     * Add publish button
     * Changes post status to 'published', making it visible to the public
     * Uses green background styling (dp-button--publish)
     * @param {string} name - Button name (default: 'publish')
     * @param {string} label - Button label text (default: 'Publish')
     * @returns {ArticleForm}
     */
    addPublishButton(name = 'publish', label = 'Publish') {
        return this.addSubmitButton(name, label, 'dp-button--publish');
    }

    /**
     * Add review button
     * Submits post for editorial review (used by authors)
     * Changes post status to 'review_requested'
     * Uses orange background styling (dp-button--review)
     * @param {string} name - Button name (default: 'review_requested')
     * @param {string} label - Button label text
     *                         (default: 'Submit for Review')
     * @returns {ArticleForm}
     */
    addReviewButton(name = 'review_requested',
                    label = 'Submit for Review') {
        return this.addSubmitButton(name, label, 'dp-button--review');
    }

    /**
     * Add save button - convenience method
     * @param {string} name
     * @param {string} label
     * @returns {ArticleForm}
     */
    addSaveButton(name = 'save', label = 'Save draft') {
        return this.addSubmitButton(name, label, 'dp-button--save');
    }

    /**
     * Add CSRF field
     * @param {string} name
     * @param {Object} options
     * @returns {string} CSRF token
     */
    addCsrfField(name = 'csrf', options = {}) {
        const element = new Csrf(name, options);
        this.add(element);
        return element.getToken();
    }

    /**
     * Initialize form with all fields
     * @param {Array|Object} categories - Category options
     * @param {Object} csrfOptions - CSRF options
     * @returns {ArticleForm}
     */
    init(categories = [], csrfOptions = {}) {
        this.addIdField();
        this.addSlugField();
        this.addTitleField();
        this.addExcerptField();
        this.addContentField();
        this.addAuthorIdField();
        this.addAuthorNameField();
        this.addCategoryField('category_id', categories);
        this.addMetaDescriptionField();
        this.addCommentEnabledField();
        this.addPublishButton();
        this.addSaveButton();

        return this;
    }
}

module.exports = ArticleForm;
