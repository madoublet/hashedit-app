/**
 * Displays a list of pages
 * @author: Matthew Smith
 */
var pages = (function () {

    'use strict';

    return {

        // properties
        listLoaded: false,
        list: null,

        // current item
        currentIndex: null,

        // api endpoints
        listUrl: '/api/pages/list/details',
        pageSettingsUrl: '/api/pages/settings',
        addPageUrl: '/api/pages/add',
        removeUrl: '/api/pages/remove',

        /**
         * Setup app
         */
        setup: function(){

            var x, y, modals, cancels;

            fetch(hashedit.app.authUrl, {
                    credentials: 'include'
                })
                .then(function(response) {

                    if (response.status !== 200) {

                        // show authorization
                        hashedit.app.showAuth();

                    } else {

                        // create list
                        pages.createList();

                        // setup events
                        pages.setupListEvents();

                        // setup modal events
                        pages.setupModalEvents();

                        // setup drawer
                        hashedit.app.setupDrawer({page: false, app: true});

                        // setup toast
                        hashedit.app.setupToast();

                        // cancel modals
                        cancels = document.querySelectorAll('[hashedit-cancel-modal]');

                        for(x=0; x<cancels.length; x++){
                            cancels[x].addEventListener('click', function(){

                                modals = document.querySelectorAll('.hashedit-modal');

                                for(y=0; y<modals.length; y++){
                                    modals[y].removeAttribute('visible');
                                }

                            });
                        }

                    }

                });

        },

        /**
         * Handles modal events
         */
        setupModalEvents: function(){

            var path, url, title, description, params, xhr, item;

            // creates a page
            document.querySelector('[hashedit-add-page-create]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot add page in demo mode', 'failure');

                } else {

                    // get params
                    path = document.getElementById('hashedit-add-page-path').value;
                    url = document.getElementById('hashedit-add-page-url').value;
                    title = document.getElementById('hashedit-add-page-title').value;
                    description = document.getElementById('hashedit-add-page-desc').value;

                    // cleanup url
                    url = url.trim();

                    if(url !== ''){
                        // cleanup url
                        url = hashedit.app.replaceAll(url, '.html', '');
                        url = hashedit.app.replaceAll(url, '.htm', '');
                        url = hashedit.app.replaceAll(url, '.', '-');
                        url = hashedit.app.replaceAll(url, ' ', '-');
                        url = hashedit.app.replaceAll(url, '/', '-');

                        // append path to url
                        url = path + '/' + url + '.html';

                        // fix duplicates
                        url = hashedit.app.replaceAll(url, '//', '/');

                        // set params
                        params = {
                            'url': url,
                            'title': title,
                            'description': description
                        };

                        if (pages.addPageUrl) {

                            // construct an HTTP request
                            xhr = new XMLHttpRequest();
                            xhr.open('post', pages.addPageUrl, true);
                            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                            // send the collected data as JSON
                            xhr.send(JSON.stringify(params));

                            xhr.onloadend = function() {

                                // hide modal
                                document.getElementById('hashedit-add-page').removeAttribute('visible');

                                // log success
                                hashedit.app.showToast('Page added at ' + url, 'success');

                                // reload list
                                pages.createList();

                            };

                        }
                    }
                    else{
                        // show success
                        hashedit.app.showToast('URL required', 'failure');
                    }
                }

            });

            // apply page settings
            document.querySelector('[hashedit-apply-page-settings]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot save settings in demo mode', 'failure');

                } else {

                    // get params
                    title = document.getElementById('hashedit-page-title').value;
                    description = document.getElementById('hashedit-page-desc').value;

                    // set params
                    params = {
                        'title': title,
                        'description': description,
                        'url': pages.list[pages.currentIndex].url
                    };

                    if (pages.pageSettingsUrl) {

                        // construct an HTTP request
                        xhr = new XMLHttpRequest();
                        xhr.open('post', pages.pageSettingsUrl, true);
                        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                        // send the collected data as JSON
                        xhr.send(JSON.stringify(params));

                        xhr.onloadend = function() {

                            // hide modal
                            document.getElementById('hashedit-page-settings').removeAttribute('visible');

                            // show success
                            hashedit.app.showToast('Settings updated successfully!', 'success');

                            // reload list
                            pages.createList();

                        };

                    }
                }


            });

            // apply page settings
            document.querySelector('[hashedit-remove-page-confirm]').addEventListener('click', function() {

                if (hashedit.demo === true) {

                    hashedit.app.showToast('Cannot remove page in demo mode', 'failure');

                } else {

                    // set params
                    params = {
                        'url': pages.list[pages.currentIndex].url
                    };

                    if (pages.removeUrl) {

                        // construct an HTTP request
                        xhr = new XMLHttpRequest();
                        xhr.open('post', pages.removeUrl, true);
                        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                        // send the collected data as JSON
                        xhr.send(JSON.stringify(params));

                        xhr.onloadend = function() {

                            // hide modal
                            document.getElementById('hashedit-remove-page').removeAttribute('visible');

                            // show success
                            hashedit.app.showToast('Page removed successfully!', 'success');

                            // reload list
                            pages.createList();

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

            // handle cancel
            cancel = document.querySelector('[hashedit-cancel-modal]');

            cancel.addEventListener('click',  function(e){
                document.getElementById('hashedit-form').removeAttribute('visible');
            });

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
                    pages.currentIndex = index;

                    if (e.target.hasAttribute('hashedit-remove-page') === true) {
                        document.getElementById('hashedit-remove-page').setAttribute('visible', '');
                    }
                    else if (e.target.hasAttribute('hashedit-page-settings') === true) {

                        document.getElementById('hashedit-page-title').value = pages.list[index].title;
                        document.getElementById('hashedit-page-desc').value = pages.list[index].description;

                        document.getElementById('hashedit-page-settings').setAttribute('visible', '');
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

            console.log('[form-kit] create list');

            // fetch list from server
            fetch(pages.listUrl, {
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
                pages.list = json;

                list = document.getElementById('hashedit-list');
                list.innerHTML = '';

                for (x = 0; x < json.length; x += 1) {
                    item = document.createElement('div');

                    if(json[x].image != ''){
                        item.setAttribute('class', 'hashedit-list-item hashedit-has-image');
                    }
                    else{
                        item.setAttribute('class', 'hashedit-list-item');
                    }

                    // create html
                    html = '<h2><span class="primary">' + json[x].title + '</span><span class="secondary">' + moment(json[x].lastModified).fromNow() + '</span></h2>';
                    html += '<small>' + json[x].url + '</small>';
                    html += '<p>' + json[x].description + '</p>';

                    if(json[x].image != ''){
                        html += '<div class="image" style="background-image: url(' + json[x].image + ')"></div>';
                    }

                    html += '<div class="hashedit-list-actions"><a hashedit-remove-page>Remove</a> <a hashedit-page-settings>Settings</a> <a href="' + json[x].editUrl + '" class="primary">Edit</a></div>';

                    item.innerHTML = html;
                    item.setAttribute('data-index', x);

                    list.appendChild(item);
                }

                pages.listLoaded = true;

            }).catch(function(ex) {
                console.log('parsing failed', ex);
            });

        }

    }
}());