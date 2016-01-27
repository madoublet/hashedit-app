/**
 * The Forms component provides advanced functionality to Hashedit Forms
 * @author: Matthew Smith
 */
var forms = (function () {

    'use strict';

    return {

        // properties
        listLoaded: false,
        list: null,

        listURL: '/api/forms/list',
        saveURL: '/api/forms/save',
        readURL: '/api/forms/read',

        /**
         * Setup app
         */
        setup: function(){

            fetch(hashedit.app.authUrl, {
                    credentials: 'include'
                })
                .then(function(response) {

                    if (response.status !== 200) {

                        // show authorization
                        hashedit.app.showAuth();

                    } else {

                        // create list
                        forms.createList();

                        // setup events
                        forms.setupListEvents();

                        // setup drawer
                        hashedit.app.setupDrawer({page: false, app: true});

                    }

                });

        },

        /**
         * Handles list events
         */
        setupListEvents: function(){

            var x, i, wrapper, drawer, html, list, item, card, details, params, html, xhr, cancel;

            // handle cancel
            cancel = document.querySelector('[hashedit-cancel-modal]');

            cancel.addEventListener('click',  function(e){
                document.getElementById('hashedit-form-modal').removeAttribute('visible');
            });

            // handle click on images list
            list = document.getElementById('hashedit-list');

            ['click'].forEach(function(e) {

                list.addEventListener(e, function(e) {

                    item = e.target;

                    if (e.target.hasAttribute('data-index') === false) {
                        item = hashedit.app.findParentBySelector(e.target, '.hashedit-list-item');
                    }

                    item.setAttribute('read', true);

                    if (item.hasAttribute('data-index') === true) {
                        i = item.getAttribute('data-index');

                        console.log(forms.readURL);

                        // save read to database
                        if (forms.readURL) {

                            params = {
                                id: forms.list[i].id
                            }

                            // construct an HTTP request
                            xhr = new XMLHttpRequest();
                            xhr.open('post', forms.readURL, true);
                            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                            // send the collected data as JSON
                            xhr.send(JSON.stringify(params));

                            xhr.onloadend = function() {};

                        }

                        details = document.getElementById('hashedit-details-list');
                        params = forms.list[i].params;


                        html = '';
                        details.innerHTML = '';

                        for(x = 0; x < params.length; x++){
                            html += '<div class="hashedit-list-item"><label>' + params[x].label + '</label>';
                            html += '<span>' + params[x].value + '</span></div>';
                        }

                        details.innerHTML = html;

                        // show modal
                        document.getElementById('hashedit-form-modal').setAttribute('visible', '');
                    }

                });

            });

        },

        /**
         * Creates the list
         */
        createList: function(){

            var list, item, html, x;

            console.log('[form-kit] create list');

            // fetch list from server
            fetch(forms.listURL, {
                credentials: 'include'
            })
            .then(function(response) {

                return response.json();

            }).then(function(json) {

                // sort by last modified
                json.sort(function(a, b) {
                    a = new Date(a.date);
                    b = new Date(b.date);
                    return a>b ? -1 : a<b ? 1 : 0;
                });

                // set list to value
                forms.list = json;

                list = document.getElementById('hashedit-list');
                list.innerHTML = '';

                for (x = 0; x < json.length; x += 1) {
                    item = document.createElement('div');
                    item.setAttribute('class', 'hashedit-list-item');

                    item.setAttribute('read', json[x].read);

                    // create html
                    html = '<h2>' + json[x].subject + '<span class="secondary">' + moment(json[x].date).fromNow() + '</span></h2>';
                    html += '<small>' + json[x].form + '</small>';
                    html += '<p>' + json[x].description + '</p>';

                    item.innerHTML = html;
                    item.setAttribute('data-id', json[x].id);
                    item.setAttribute('data-index', x);

                    list.appendChild(item);
                }

                forms.listLoaded = true;

            }).catch(function(ex) {
                console.log('parsing failed', ex);
            });


        }

    }
}());