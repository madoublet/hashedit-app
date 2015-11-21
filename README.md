# Hashedit Spark

Hashedit Spark is an API backend for hashedit.io.  It provides authentication and features to manipulate your static site.  Hashedit Spark requires Git, Node JS, Nodemon, NPM, and Bower.

## Getting Started

##### 1. Create a directory for your NodeJS site.
```
mkdir my-site
cd my-site
```

##### 2. Clone the repository into your folder structure.
```
git clone https://github.com/madoublet/hashedit-spark .
```

##### 3. Copy the configuration file.  Update the app.url, google.clientId, google.clientSecret, and add an authorized email address.

```
cp config.sample.js config.js
nano config.js
```

##### 4. Install Node JS dependencies
```
npm install
```

##### 5. Start your server
```
node app.js
```