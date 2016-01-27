/**
 * Displays a list of pages
 * @author: Matthew Smith
 */
var users = (function () {

    'use strict';

    return {

        // properties
        listLoaded: false,
        list: null,

        // current item
        currentIndex: null,

        // api endpoints
        listUrl: '/api/users/list',
        addUrl: '/api/users/add',
        editUrl: '/api/users/edit',
        removeUrl: '/api/users/remove',

        /**
         * Setup app
         */
        setup: function(){

            var x, y, modals, cancels, add;

            fetch(hashedit.app.authUrl, {
                    credentials: 'include'
                })
                .then(function(response) {

                    if (response.status !== 200) {

                        // show authorization
                        hashedit.app.showAuth();

                    } else {

                        // create list
                        users.createList();

                        // setup events
                        users.setupListEvents();

                        // setup modal events
                        users.setupModalEvents();

                        // setup drawer
                        hashedit.app.setupDrawer({page: false, app: true});

                        // setup toast
                        hashedit.app.setupToast();

                        // cancel modals
                        cancels = document.querySelectorAll('[hashedit-cancel-modal]');

                        for(x=0; x<cancels.length; x++){
                            cancels[x].addEventListener('click', function() {

                                modals = document.querySelectorAll('.hashedit-modal');

                                for(y=0; y<modals.length; y++){
                                    modals[y].removeAttribute('visible');
                                }

                            });
                        }
                        
                        // add modal
                        document.querySelector('[hashedit-show-add]').addEventListener('click', function() {
                            document.getElementById('hashedit-add-user-modal').setAttribute('visible', '');
                            
                            // set defaults
                            document.getElementById('hashedit-add-user-provider').value = 'local';
                            document.getElementById('hashedit-add-user-email').value = '';
                            document.getElementById('hashedit-add-user-password').value = '';
                        });

                    }

                });

        },

        /**
         * Handles modal events
         */
        setupModalEvents: function(){

            var provider, email, password, params, xhr, item;

            // creates a page
            document.querySelector('[hashedit-add-user-create]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot add user in demo mode', 'failure');

                } else {

                    // get params
                    provider = document.getElementById('hashedit-add-user-provider').value;
                    email = document.getElementById('hashedit-add-user-email').value;
                    password = document.getElementById('hashedit-add-user-password').value;

                    if(email !== ''){
                        
                        // set params
                        params = {
                            'provider': provider,
                            'email': email,
                            'password': password
                        };

                        if (users.addUrl) {

                            // construct an HTTP request
                            xhr = new XMLHttpRequest();
                            xhr.open('post', users.addUrl, true);
                            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                            // send the collected data as JSON
                            xhr.send(JSON.stringify(params));

                            xhr.onloadend = function() {

                                // hide modal
                                document.getElementById('hashedit-add-user-modal').removeAttribute('visible');

                                // log success
                                hashedit.app.showToast('User added successfully', 'success');

                                // reload list
                                users.createList();

                            };

                        }
                    }
                    else{
                        // show success
                        hashedit.app.showToast('Email required', 'failure');
                    }
                }

            });

            // handle change of select
            document.querySelector('#hashedit-add-user-provider').addEventListener('change', function(e) {

                var provider = e.target.value;

                if(provider === 'local') {
                    document.getElementById('hashedit-add-user-password-display').style.display = 'block';
                }
                else{
                    document.getElementById('hashedit-add-user-password-display').style.display = 'none';
                }

            });

            // remove user
            document.querySelector('[hashedit-remove-user-confirm]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot remove user in demo mode', 'failure');

                } else {

                    // set params
                    params = {
                        'id': users.list[users.currentIndex].id
                    };
                    
                    if (users.removeUrl) {

                        // construct an HTTP request
                        xhr = new XMLHttpRequest();
                        xhr.open('post', users.removeUrl, true);
                        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                        // send the collected data as JSON
                        xhr.send(JSON.stringify(params));

                        xhr.onloadend = function() {

                            // hide modal
                            document.getElementById('hashedit-remove-user-modal').removeAttribute('visible');

                            // show success
                            hashedit.app.showToast('User removed successfully!', 'success');

                            // reload list
                            users.createList();

                        };

                    }
                }


            });
            
            // edit user
            document.querySelector('[hashedit-edit-user-update]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot edit user in demo mode', 'failure');

                } else {

                    // set params
                    params = {
                        'id': users.list[users.currentIndex].id,
                        'email': document.getElementById('hashedit-edit-user-email').value,
                        'password': document.getElementById('hashedit-edit-user-password').value
                    };
                    
                    if (users.editUrl) {

                        // construct an HTTP request
                        xhr = new XMLHttpRequest();
                        xhr.open('post', users.editUrl, true);
                        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                        // send the collected data as JSON
                        xhr.send(JSON.stringify(params));

                        xhr.onloadend = function() {

                            // hide modal
                            document.getElementById('hashedit-edit-user-modal').removeAttribute('visible');

                            // show success
                            hashedit.app.showToast('User updated successfully!', 'success');

                            // reload list
                            users.createList();

                        };

                    }
                }


            });


        },

        /**
         * Handles list events
         */
        setupListEvents: function(){

            var x, i, wrapper, drawer, html, list, item, items, card, details, params, html, xhr, cancel, index;

            // handle click on images list
            list = document.getElementById('hashedit-list');

            ['click'].forEach(function(e) {

                list.addEventListener(e, function(e) {

                    item = e.target;

                    if (e.target.hasAttribute('data-index') === false) {
                        item = hashedit.app.findParentBySelector(e.target, '.hashedit-list-item');
                    }

                    // retrieve current index
                    index = item.getAttribute('data-index');

                    // set current index
                    users.currentIndex = index;

                    if (e.target.hasAttribute('hashedit-remove-user') === true) {
                        document.getElementById('hashedit-remove-user-modal').setAttribute('visible', '');
                    }
                    else if (e.target.hasAttribute('hashedit-edit-user') === true) {

                        var provider = users.list[index].provider;

                        document.getElementById('hashedit-edit-user-email').value = users.list[index].email;
                        document.getElementById('hashedit-edit-user-password').setAttribute('value', 'temppassword');

                        if(provider === 'local') {
                            document.getElementById('hashedit-edit-user-password-display').style.display = 'block';
                        }
                        else{
                            document.getElementById('hashedit-edit-user-password-display').style.display = 'none';
                        }

                        document.getElementById('hashedit-edit-user-modal').setAttribute('visible', '');
                    }
                    else{

                        // clear other active items
                        items = document.querySelectorAll('.hashedit-list-item[active]');

                        for(x=0; x<items.length; x++){
                            items[x].removeAttribute('active');
                        }

                        // set active
                        item.setAttribute('active', '');

                    }

                });

            });

        },

        /**
         * Creates the list
         */
        createList: function(){

            var list, item, html, x;

            console.log('[hashedit-users] create list');

            // fetch list from server
            fetch(users.listUrl, {
                credentials: 'include'
            })
            .then(function(response) {

                return response.json();

            }).then(function(json) {

                // sort by last modified
                json.sort(function(a, b) {
                    a = new Date(a.lastModified);
                    b = new Date(b.lastModified);
                    return a>b ? -1 : a<b ? 1 : 0;
                });

                // set list to value
                users.list = json;

                list = document.getElementById('hashedit-list');
                list.innerHTML = '';

                for (x = 0; x < json.length; x += 1) {
                    item = document.createElement('div');

                    if(json[x].image != ''){
                        item.setAttribute('class', 'hashedit-list-item');
                    }
                    else{
                        item.setAttribute('class', 'hashedit-list-item');
                    }

                    // create html
                    html = '<h2><span class="primary">' + json[x].email + '</span><span class="secondary">' + moment(json[x].date).fromNow() + '</span></h2>';
                    html += '<small>' + json[x].provider + '</small>';


                    html += '<div class="hashedit-list-actions"><a hashedit-remove-user>Remove</a> <a hashedit-edit-user class="primary">Edit</a></div>';

                    item.innerHTML = html;
                    item.setAttribute('data-index', x);

                    list.appendChild(item);
                }

                users.listLoaded = true;

            }).catch(function(ex) {
                console.log('parsing failed', ex);
            });

        }

    }
}());