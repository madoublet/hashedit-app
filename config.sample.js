var exports = module.exports = {};

// app configurations
exports.app = {
    "url": "https://my-hashedit-site.io",
    "port": 3000
};

// setup google authentication
exports.google = {
    "clientId": "GOOGLE_CLIENT_ID",
    "clientSecret": "GOOGLE_CLIENT_SECRET"
};

// setup authorized users
exports.authorized = [
{
    "email": "sample@gmail.com",
    "provider": "google"
}
];