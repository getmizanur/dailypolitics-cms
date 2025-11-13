const Form = require(
    global.applicationPath('/library/mvc/form/form'));
const Radio = require(
    global.applicationPath('/library/mvc/form/element/radio'));
const Submit = require(
    global.applicationPath('/library/mvc/form/element/submit'));

class IntroForm extends Form {
	constructor(options = {}) {
		super(options);
	}

	addMyselfOption(name = 'person-applying') {
		var element = new Radio(name);
        element.setLabelAttributes({
            "class" : "nhsuk-label nhsuk-radios__label",
        });
		element.setValueOptions([
			{
				"value": "Myself",
				"label": "Myself", 
				"attributes" : {
					"class" : "nhsuk-radios__input"
				},
                "label_attributes" : {
                    "class" : "nhsuk-label nhsuk-radios__label",
                    "for" : "person-applying-1"
				}
			},{
				"value": "Someoneelse",
				"label": "Someone else",
				"attributes" : {
					"class" : "nhsuk-radios__input",
					"aria-controls" : "conditional-person-applying-2",
					"aria-expanded" : "false"
				},
				"label_attributes" : {
                    "class" : "nhsuk-label nhsuk-radios__label",
                    "for" : "person-applying-2"
				}
			}
		]);
        //element.setMessages(['test', 'test2']);
		this.add(element);
	}

	addSomeoneElseOption(name = 'Someoneelse') {
		const element = new Radio(name);
		element.setAttributes({
			"class" : "nhsuk-radios__input", 
			"id" : "person-applying-2",
			"aria-controls" : "conditional-person-applying-2", 
			"aria-expanded" : "false"
		});
		element.setLabelAttributes({
			"class" : "nhsuk-label nhsuk-radios__label"
		});
        element.setValueOptions([
            {
                value : "a",
                label : "are under 16 and I am their parent or guardian",
                attributes : {
                    "class" : "nhsuk-radios__input",
                    "id" : "Someoneelse-1"
                },
                label_attributes : {
                    "class" : "nhsuk-label nhsuk-radios__label",
                    "for" : "Someoneelse-1"
                }
            },{
                value : "b",
                label : "unable to manage their own affairs due to age or disability",
                attributes : {
                    "class" : "nhsuk-radios__input",
                    "id" : "Someoneelse-2"
                },
                label_attributes : {
                    "class" : "nhsuk-label nhsuk-radios__label",
                    "for" : "Someoneelse-2"
                }
            },{
                value : "c",
                label : "have died",
                attributes : {
                    "class" : "nhsuk-radios__input",
                    "id" : "Someoneelse-3"
                },
                label_attributes : {
                    "class" : "nhsuk-label nhsuk-radios__label",
                    "for" : "Someoneelse-3"
                }
            }
        ]);
		this.add(element);
	}

    addContinueButton(name = 'continue', value = 'Continue') {
        const element = new Submit(name);
        element.setValue(value);
        element.setAttributes({
            "class" : "nhsuk-button"
        });
        this.add(element);
    }

}

module.exports = IntroForm;
