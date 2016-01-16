// submits a form to the hashedit app
var formkit = (function () {

    'use strict';

    return {

        listLoaded: false,
        list: null,

        listURL: '/api/forms/list',
        saveURL: '/api/forms/save',
        readURL: '/api/forms/read',

        /**
        * Init client functionality for form-kit
        */
        init: function(){

            var x, y, z, form, forms, fields, el, els, name, label, value, params, data, xhr, saveURL, success, failure, subjectField, descriptionField, subject, description;

            // get all forms
            forms = document.querySelectorAll('[form-kit-form]');

            for(x=0; x<forms.length; x++){

                // init params, data
                params = [];
                data = [];

                // handle invalid
                forms[x].addEventListener('invalid', function(e){

                    form = e.target.form;

                    // show message
                    failure = form.querySelector('[form-kit-failure]');
                    failure.setAttribute('active', '');

                }, true);

                // handle submit
                forms[x].addEventListener('submit', function(e){

                    form = e.target;

                    // get subject and description
                    subjectField = form.getAttribute('data-subject') || '';
                    descriptionField = form.getAttribute('data-description') || '';

                    // set defaults
                    subject = '';
                    description = '';

                    // get fields
                    fields = e.target.querySelectorAll('.field');

                    // walk through fields
                    for(y=0; y<fields.length; y++){

                       // get label
                       el = fields[y].querySelector('label');
                       label = el.innerHTML || 'no label';

                       // get name, value for text
                       if((el = fields[y].querySelector('input[type=text], input[type=email], input[type=phone], textarea, input[type=radio]:checked, select')) !== null){
                           name = el.getAttribute('name');
                           value = el.value;
                       }
                       else if((els = fields[y].querySelectorAll('input[type=checkbox]:checked')).length > 0){
                            name = el.getAttribute('name');

                            // create comma separated list
                            for(y=0; y<els.length; y++){
                                value += els[y].value + ', ';
                            }

                            // remove trailing comma and space
                            if(value != ''){
                                value = value.slice(0, -2);
                            }
                       }

                       // set subject
                       if(name === subjectField){
                           subject = value;
                       }

                       // set description
                       if(name === descriptionField){
                           description = value;
                       }

                       // push params
                       params.push({
                           name: name,
                           label: label,
                           value: value
                       });

                    }

                    // create obj to send to form-kit
                    data = {
                        id: hashedit.guid(),
                        form: e.target.getAttribute('name') || 'form-kit-default',
                        subject: subject,
                        description: description,
                        read: false,
                        params: params,
                        date: new Date()
                    };

                    // construct an HTTP request
                    xhr = new XMLHttpRequest();
                    xhr.open('post', formkit.saveURL, true);
                    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                    // send the collected data as JSON
                    xhr.send(JSON.stringify(data));

                    xhr.onloadend = function() {

                        // hide error
                        failure = form.querySelector('[form-kit-failure]');
                        failure.removeAttribute('active');

                        // show message
                        success = form.querySelector('[form-kit-success]');
                        success.setAttribute('active', '');

                        // clear form
                        form.reset();

                    };

                    // prevent standard submit
                    e.preventDefault();
                });

            }

        },

        /**
         * Setup editor functionality for formKit
         */
        setup:function(){

            if(window.location.href.indexOf('#edit') == -1){
                formkit.init();
            }

        }
    }

})();