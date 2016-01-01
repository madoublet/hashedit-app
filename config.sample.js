var exports = module.exports = {};

// app configurations
exports.app = {
    "url": "https://my-hashedit-site.io",
    "port": 3000
};

// set the hashedit drawer for the app
exports.drawer = {
  page: [
    {
        text: 'Add Page',
        attr: 'hashedit-add-page'
    },
    {
        text: 'Page Settings',
        attr: 'hashedit-page-settings'
    },
    {
        text: 'Return to Page',
        attr: 'hashedit-exit'
    }
  ],
  app: [
    {
        text: 'Pages',
        href: '/admin/pages'
    },
    {
        text: 'Logout',
        href: '/logout'
    }
  ]
};

// setup google authentication
exports.google = {
    "clientId": "GOOGLE_CLIENT_ID",
    "clientSecret": "GOOGLE_CLIENT_SECRET"
};

];