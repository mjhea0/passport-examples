# Social Authentication with Passport.js

- In this post we'll add social authentication - Facebook, Twitter, Github, Google, and Instagram - to Node.js.
- View the blog post here: http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/

> Updated on November 27th, 2015 - Refactored and added Instagram Authentication

### Final project:

![fb](https://raw.github.com/mjhea0/passport-examples/master/public/img/final.png)

### Quick Start

1. Clone
1. `npm install`
1. Add *oauth.js* file to the root and add the social IDs and keys:

  ```javascript
  var ids = {
    facebook: {
      clientID: 'get_your_own',
      clientSecret: 'get_your_own',
      callbackURL: 'http://127.0.0.1:1337/auth/facebook/callback'
    },
    twitter: {
      consumerKey: 'get_your_own',
      consumerSecret: 'get_your_own',
      callbackURL: "http://127.0.0.1:1337/auth/twitter/callback"
    },
    github: {
      clientID: 'get_your_own',
      clientSecret: 'get_your_own',
      callbackURL: "http://127.0.0.1:1337/auth/github/callback"
    },
    google: {
      consumerKey: 'get_your_own',
      consumerSecret: 'get_your_own',
      callbackURL: 'http://127.0.0.1:1337/auth/google/callback'
    },
    instagram: {
      clientID: 'get_your_own',
      clientSecret: 'get_your_own',
      callbackURL: 'http://127.0.0.1:1337/auth/instagram/callback'
    }
  };

  module.exports = ids;
  ```

1. Run `node app.js`


