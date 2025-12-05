const Form = require(
    global.applicationPath('/library/form/form'));
const Text = require(
    global.applicationPath('/library/form/element/text'));
const Textarea = require(
    global.applicationPath('/library/form/element/textarea'));
const Radio = require(
    global.applicationPath('/library/form/element/radio'));
const Checkbox = require(
    global.applicationPath('/library/form/element/checkbox'));
const Submit = require(
    global.applicationPath('/library/form/element/submit'));
const Csrf = require(
    global.applicationPath('/library/form/element/csrf'));

/**
 * ContactForm - Form for contact page
 * Handles general enquiries, sponsored article requests, and issue reports
 */
class ContactForm extends Form {
    /**
     * Constructor
     * @param {Object} options - Form options (action, method, etc.)
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * Add category selection field
     * Radio buttons for contact reason
     * @param {string} name - Field name
     */
    addWhatsItToDoWithOptionField(name = 'whats_it_to_do_with') {
        const element = new Radio(name);
        element.setLabel("What's it to do with?");
        element.setLabelAttributes({
            "class": "dp-label dp-fieldset__legend"
        });
        element.setValueOptions([
            {
                "value": "General enquiry",
                "label": "General enquiry",
                "attributes": {
                    "class": "dp-radios__input"
                },
                "label_attributes": {
                    "class": "dp-label dp-radios__label"
                }
            },
            {
                "value": "Sponsored article",
                "label": "Sponsored article",
                "attributes": {
                    "class": "dp-radios__input"
                },
                "label_attributes": {
                    "class": "dp-label dp-radios__label"
                }
            },
            {
                "value": "Report an issue",
                "label": "Report an issue",
                "attributes": {
                    "class": "dp-radios__input"
                },
                "label_attributes": {
                    "class": "dp-label dp-radios__label"
                }
            },
            {
                "value": "Write for us",
                "label": "Write for us",
                "attributes": {
                    "class": "dp-radios__input"
                },
                "label_attributes": {
                    "class": "dp-label dp-radios__label"
                }
            }
        ]);
        this.add(element);
    }

    /**
     * Add message field
     * Textarea for detailed message
     * @param {string} name - Field name
     */
    addMessageField(name = 'message') {
        const element = new Textarea(name);
        element.setLabel('Can you provide more detail?');
        element.setAttributes({
            'class': 'dp-textarea',
            'id': 'message',
            'rows': 5,
            'maxlength': 200
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
    }

    /**
     * Add name field
     * Text input for user's name
     * @param {string} name - Field name
     */
    addNameField(name = 'name') {
        const element = new Text(name);
        element.setLabel('Your name');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'name',
            'autocomplete': 'name'
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
    }

    /**
     * Add email field
     * Email input with helper text
     * @param {string} name - Field name
     */
    addEmailField(name = 'email') {
        const element = new Text(name);
        element.setLabel('Your email address');
        element.setAttributes({
            'class': 'dp-input',
            'id': 'email',
            'type': 'email',
            'autocomplete': 'email',
            'spellcheck': 'false'
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
    }

    /**
     * Add reply preference checkbox
     * @param {string} name - Field name
     */
    addReplyCheckbox(name = 'want_reply') {
        const element = new Checkbox(name);
        element.setLabel('I want a reply');
        element.setAttributes({
            'class': 'dp-checkboxes__input',
            'id': 'want_reply',
            'value': '1'
        });
        element.setLabelAttribute('class', 'dp-label dp-checkboxes__label');
        this.add(element);
    }

    /**
     * Add submit button
     * @param {string} name - Button name
     */
    addSubmitButton(name = 'submit') {
        const element = new Submit(name);
        element.setValue('Send message');
        element.setAttributes({
            'class': 'dp-button'
        });
        this.add(element);
    }

    /**
     * Add CSRF protection field
     * @param {string} name - Field name
     * @param {Object} options - CSRF options
     * @returns {string} The generated CSRF token
     */
    addCsrfField(name = 'csrf', options = {}) {
        const element = new Csrf(name, options);
        this.add(element);
        return element.getToken();
    }
}

module.exports = ContactForm;