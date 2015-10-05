# Hashedit Spark

Static Spark is an API backend for hashedit.io.  It provides authentication and features to manipulate your static site.  Static Spark requires Git, Node JS, NPM, and Bower.

## Getting Started

##### 1. Create a directory for your NodeJS site.
```
mkdir my-app
cd my-app
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

##### 4. Install dependencies
```
npm install
```

##### 5. Install Hashedit
```
bower install hashedit
```

##### 6. Start your server
```
cd ..
DEBUG=static-spark npm start
```