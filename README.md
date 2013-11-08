# Social Authentication with Passport.js

In this post we'll add social authentication - Facebook, Twitter, Github, and Google - to Node.js. 

## Contents
1. Setup
2. Register Oauth
3. Edit app.js
4. Edit index.jade
5. Edit account.jade
6. Test Facebook Auth
7. Add remaining Providers
8. Mongoose
9. Test Redux
10. Current Codebase
11. Code Cleanup
12. Mongoose Redux
13. Unit Tests
14. Conclusion

## Setup

1. Download the starter template

 ```shell
 $ git clone https://github.com/mjhea0/node-bootstrap3-template.git passport-examples
 $ cd passport-examples
 $ npm install
 ```

2. Test locally

 ```shell
 $ node app
 ```
 
 Navigate to [http://localhost:1337/](http://localhost:1337/)

3. Install additional dependendencies:

 ```shell
 $ npm install passport --save
 $ npm install passport-facebook --save
 $ npm install passport-twitter --save
 $ npm install passport-github --save
 $ npm install passport-google --save
 $ npm install mongoose --save
 ```

## Register Oauth

Register your application (or in this case a dummy application) with all of the OAuth providers you want to use, expect Google - as Google uses [OpenID](http://stackoverflow.com/questions/1087031/whats-the-difference-between-openid-and-oauth). Each Oauth provider handles authentication differently and has names for their authentication keys, so make sure to read the documentation before setting up an application.

> In all cases use the following url for the call - "http://localhost:1337/auth/[oauth_provider_name]/callback". Also, be sure to take note of the generated authentication keys.

### Facebook

![fb](https://raw.github.com/mjhea0/passport-examples/master/public/img/facebook.png)

### Twitter

![twitter](https://raw.github.com/mjhea0/passport-examples/master/public/img/twitter.png)

### Github

![github](https://raw.github.com/mjhea0/passport-examples/master/public/img/github.png)

## Setup an authentication file

1. Create a seperate file in the root directory called "ouath.js" and add the following code:

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
   }
   google: {
     returnURL: 'http://127.0.0.1:1337/auth/google/callback',
     realm: 'http://127.0.0.1:1337'
   }
 }

 module.exports = ids
 ```

2. Make sure to add this file to the ".gitignore" so when you push to Github, your keys are not included in the repo.

## Edit app.js 

1. Add the following requirements:

  ```javascript
  var config = require('./oauth.js')
  var mongoose = require('mongoose')
  var passport = require('passport')
  var FacebookStrategy = require('passport-facebook').Strategy;
  var TwitterStrategy = require('passport-twitter').Strategy;
  var GithubStrategy = require('passport-github').Strategy;
  var GoogleStrategy = require('passport-google').Strategy;
  ```

2. Update the rest of "app.js" with the following code (check the comments for a brief explanation):

 ```javascript
 // seralize and deseralize
 passport.serializeUser(function(user, done) {
   done(null, user);
 });
 passport.deserializeUser(function(obj, done) {
   done(null, obj);
 });

 // config
 passport.use(new FacebookStrategy({
     clientID: config.fb.clientID,
     clientSecret: config.fb.clientSecret,
     callbackURL: config.fb.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));

 var app = express();

 app.configure(function() {
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.logger());
   app.use(express.cookieParser());
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(express.session({ secret: 'my_precious' }));
   app.use(passport.initialize());
   app.use(passport.session());
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
 });

 // routes
 app.get('/', routes.index);
 app.get('/ping', routes.ping);
 app.get('/account', ensureAuthenticated, function(req, res){
   res.render('account', { user: req.user });
 });

 app.get('/', function(req, res){
   res.render('login', { user: req.user });
 });

 app.get('/auth/facebook',
   passport.authenticate('facebook'),
   function(req, res){
   });
 app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/');
 });

 // port
 app.listen(1337);

 // test authentication
 function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/')
 }
 ```

## Edit index.jade

1. Add the following url:

 ```jade
 a(href="/auth/facebook") Login via Facebook
 ```

## Edit account.jade

1. Add a new file called "account.jade" to the "view" folder with the following code:

 ```jade
 !!! 5
 html
   head
     title= title
     meta(name='viewport', content='width=device-width, initial-scale=1.0')
     link(href='/css/bootstrap.min.css', rel='stylesheet', media='screen')
   body
   .container             
     h1 You are logged in.
     p.lead Say something worthwhile here.
     a(href="/") Go home
     br
     a(href="/ping") Ping
     br
     br
     a(href="/logout") Logout

   script(src='http://code.jquery.com/jquery.js')
   script(src='js/bootstrap.min.js')
 ```

## Test Facebook Auth

Fire up the server and test! You should be redireted to the `/account` page after authentication.

## Add remaining providers

1. Add the remaining providers, one by one, testing as you go, until your "app.js" file looks like this:

```javascript
 // dependencies
 var fs = require('fs');
 var express = require('express');
 var routes = require('./routes');
 var path = require('path');
 var app = express();
 var config = require('./oauth.js')
 var mongoose = require('mongoose')
 var passport = require('passport')
 var FacebookStrategy = require('passport-facebook').Strategy;
 var TwitterStrategy = require('passport-twitter').Strategy;
 var GithubStrategy = require('passport-github').Strategy;
 var GoogleStrategy = require('passport-google').Strategy;
 
 
 // seralize and deseralize
 passport.serializeUser(function(user, done) {
   done(null, user);
 });
 passport.deserializeUser(function(obj, done) {
   done(null, obj);
 });
 
 // config
 passport.use(new FacebookStrategy({
     clientID: config.facebook.clientID,
     clientSecret: config.facebook.clientSecret,
     callbackURL: config.facebook.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));
 passport.use(new TwitterStrategy({
     consumerKey: config.twitter.consumerKey,
     consumerSecret: config.twitter.consumerSecret,
     callbackURL: config.twitter.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));
 passport.use(new GithubStrategy({
     clientID: config.github.clientID,
     clientSecret: config.github.clientSecret,
     callbackURL: config.github.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));
 passport.use(new GoogleStrategy({
     returnURL: config.google.returnURL,
     realm: config.google.realm
   },
   function(identifier, profile, done) {
     process.nextTick(function () {
       profile.identifier = identifier;
       return done(null, profile);
     });
   }
 ));
 
 var app = express();
 
 app.configure(function() {
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.logger());
   app.use(express.cookieParser());
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(express.session({ secret: 'my_precious' }));
   app.use(passport.initialize());
   app.use(passport.session());
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
 });
 
 // routes
 app.get('/', routes.index);
 app.get('/ping', routes.ping);
 app.get('/account', ensureAuthenticated, function(req, res){
   res.render('account', { user: req.user });
 });
 app.get('/auth/facebook',
   passport.authenticate('facebook'),
   function(req, res){
   });
 app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/twitter',
   passport.authenticate('twitter'),
   function(req, res){
   });
 app.get('/auth/twitter/callback', 
   passport.authenticate('twitter', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/github',
   passport.authenticate('github'),
   function(req, res){
   });
 app.get('/auth/github/callback', 
   passport.authenticate('github', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/google',
   passport.authenticate('google'),
   function(req, res){
   });
 app.get('/auth/google/callback', 
   passport.authenticate('google', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/');
 });
 
 // port
 app.listen(1337);
 
 // test authentication
 function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/')
 }
``` 
> Don't worry, we will be cleaning up the code in a bit, breaking up "app.js" into several files. For now, we just want to ensure that authentication works.

2. Update "account.jade"

 ```jade
 !!! 5
 html
   head
     title= title
     meta(name='viewport', content='width=device-width, initial-scale=1.0')
     link(href='/css/bootstrap.min.css', rel='stylesheet', media='screen')
   body
   .container              
     h1 Say something meaningful here.
     p.lead Say something worthwhile here.
     a(href="/") Go home
     br
     a(href="/ping") Ping
     br
     br
     a(href="/auth/facebook") Login via Facebook
     br
     a(href="/auth/twitter") Login via Twitter
     br
     a(href="/auth/github") Login via Github
     br
     a(href="/auth/Google") Login via Google
 
   script(src='http://code.jquery.com/jquery.js')
   script(src='js/bootstrap.min.js')
   ```
2. Test everything again multiple times.

## Mongoose

Now let's take it a step further and save the user in MongoDB via mongoose.

1. Add the following code just before the config section in "app.js":

 ```javascript
 // connect to the database
 mongoose.connect('mongodb://localhost/passport-example');

 // create a user model
	var User = mongoose.model('User', {
		oauthID: number,
		name: string
	});
 ```

2. Update the `FacebookStrategy' so that it saves the user if s/he doesn't exist in the database:

 ```javascript
 passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
  User.findOne({ oauthID: profile.id }, function(err, user) {
    if(err) { console.log(err); }
    if (!err && user != null) {
      done(null, user);
    } else {
      var user = new User({
        oauthID: profile.id,
        name: profile.displayName,
        created: Date.now()
      });
      user.save(function(err) {
        if(err) { 
          console.log(err); 
        } else {
          console.log("saving user ...");
          done(null, user);
        };
      });
    };
  });
 }
 ));
 ```
 
3. Move the serilization/deseralization after the config section and update:

 ```javascript
 // seralize and deseralize
 passport.serializeUser(function(user, done) {
     console.log('serializeUser: ' + user._id)
     done(null, user._id);
 });
 passport.deserializeUser(function(id, done) {
     User.findById(id, function(err, user){
         console.log(user)
         if(!err) done(null, user);
         else done(err, null)  
     })
 });
 ```
 
4. Update the `/account` route:

 ```javascript
 app.get('/account', ensureAuthenticated, function(req, res){
   User.findById(req.session.passport.user, function(err, user) {
     if(err) { 
       console.log(err); 
     } else {
       res.render('account', { user: user});
     };
   });
 });
 ```

## Test Redux

Fire up the server and make sure Facebook authentication is still working. Once logged in, open a mongo shell and ensure there is a new user in the database. Log in and log out several times with Facebook. Check the mongo shell again. There should still only be one user.

## Current Codebase

1. Right now our code in "app.js" looks like this:

 ```javascript
// dependencies
 var fs = require('fs');
 var express = require('express');
 var routes = require('./routes');
 var path = require('path');
 var app = express();
 var config = require('./oauth.js')
 var mongoose = require('mongoose')
 var passport = require('passport')
 var FacebookStrategy = require('passport-facebook').Strategy;
 var TwitterStrategy = require('passport-twitter').Strategy;
 var GithubStrategy = require('passport-github').Strategy;
 var GoogleStrategy = require('passport-google').Strategy;

 // connect to the database
 mongoose.connect('mongodb://localhost/passport-example');

 // create a user model
 var User = mongoose.model('User', {
   oauthID: Number,
   name: String,
   created: Date
 });

 // config
 passport.use(new FacebookStrategy({
     clientID: config.facebook.clientID,
     clientSecret: config.facebook.clientSecret,
     callbackURL: config.facebook.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
   User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) { 
           console.log(err); 
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
   });
 }
 ));

 passport.use(new TwitterStrategy({
     consumerKey: config.twitter.consumerKey,
     consumerSecret: config.twitter.consumerSecret,
     callbackURL: config.twitter.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));
 passport.use(new GithubStrategy({
     clientID: config.github.clientID,
     clientSecret: config.github.clientSecret,
     callbackURL: config.github.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
     process.nextTick(function () {
       return done(null, profile);
     });
   }
 ));
 passport.use(new GoogleStrategy({
     returnURL: config.google.returnURL,
     realm: config.google.realm
   },
   function(identifier, profile, done) {
     process.nextTick(function () {
       profile.identifier = identifier;
       return done(null, profile);
     });
   }
 ));

 var app = express();

 app.configure(function() {
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.logger());
   app.use(express.cookieParser());
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(express.session({ secret: 'my_precious' }));
   app.use(passport.initialize());
   app.use(passport.session());
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
 });

 // seralize and deseralize
 passport.serializeUser(function(user, done) {
     console.log('serializeUser: ' + user._id)
     done(null, user._id);
 });
 passport.deserializeUser(function(id, done) {
     User.findById(id, function(err, user){
         console.log(user)
         if(!err) done(null, user);
         else done(err, null)  
     })
 });

 // routes
 app.get('/', routes.index);
 app.get('/ping', routes.ping);
 app.get('/account', ensureAuthenticated, function(req, res){
   User.findById(req.session.passport.user, function(err, user) {
     if(err) { 
       console.log(err); 
     } else {
       res.render('account', { user: user});
     };
   });
 });
 app.get('/auth/facebook',
   passport.authenticate('facebook'),
   function(req, res){
   });
 app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/twitter',
   passport.authenticate('twitter'),
   function(req, res){
   });
 app.get('/auth/twitter/callback', 
   passport.authenticate('twitter', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/github',
   passport.authenticate('github'),
   function(req, res){
   });
 app.get('/auth/github/callback', 
   passport.authenticate('github', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/google',
   passport.authenticate('google'),
   function(req, res){
   });
 app.get('/auth/google/callback', 
   passport.authenticate('google', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/');
 });

 // port
 app.listen(1337);

 // test authentication
 function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/')
 }
 ```
 It's a mess. Let's clean it up, breaking apart concerns, and add in the remaining mongoose code.
 
## Code Cleanup

1. multiple authentication providers to a single user account?
2. Create a separate file for your mongoose info called "users.js":

 ```javascript
 var mongoose = require('mongoose')

 // create a user model
 var User = mongoose.model('User', {
   oauthID: Number,
   name: String,
   created: Date
 });
 
 module.exports = User;
 ```
 
 Make sure to add the file as a dependency in "app.js": `var User = require('./user.js')`
 
3. Now let's move the social config to a seperate file called "authentication.js":
 
 ```javascript
 var passport = require('passport')
 var FacebookStrategy = require('passport-facebook').Strategy;
 var User = require('./user.js')
 var config = require('./oauth.js')

 module.exports = passport.use(new FacebookStrategy({
     clientID: config.facebook.clientID,
     clientSecret: config.facebook.clientSecret,
     callbackURL: config.facebook.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
   User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) { 
           console.log(err); 
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
   });
 }
 ));
 ```

4. Update the dependencies in "app.js"

 ```javascript
 // dependencies
 var fs = require('fs');
 var express = require('express');
 var routes = require('./routes');
 var path = require('path');
 var app = express();
 var config = require('./oauth.js')
 var User = require('./user.js')
 var mongoose = require('mongoose')
 var passport = require('passport')
 var fbAuth = require('./authentication.js')
 var TwitterStrategy = require('passport-twitter').Strategy;
 var GithubStrategy = require('passport-github').Strategy;
 var GoogleStrategy = require('passport-google').Strategy;
 ```
 
## Mongoose Redux

1. Move the remaining auth configs to "authentication.js" and add in the mongoose code to save the user:

 ```javascript
 var passport = require('passport')
 var FacebookStrategy = require('passport-facebook').Strategy;
 var TwitterStrategy = require('passport-twitter').Strategy;
 var GithubStrategy = require('passport-github').Strategy;
 var GoogleStrategy = require('passport-google').Strategy;
 var User = require('./user.js')
 var config = require('./oauth.js')

  // config
  module.exports = passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
    User.findOne({ oauthID: profile.id }, function(err, user) {
      if(err) { console.log(err); }
      if (!err && user != null) {
        done(null, user);
      } else {
        var user = new User({
          oauthID: profile.id,
          name: profile.displayName,
          created: Date.now()
        });
        user.save(function(err) {
          if(err) { 
            console.log(err); 
          } else {
            console.log("saving user ...");
            done(null, user);
          };
        });
      };
    });
  }
  ));
 passport.use(new TwitterStrategy({
     consumerKey: config.twitter.consumerKey,
     consumerSecret: config.twitter.consumerSecret,
     callbackURL: config.twitter.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
   User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) { 
           console.log(err); 
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
   });
 }
 ));
 passport.use(new GithubStrategy({
     clientID: config.github.clientID,
     clientSecret: config.github.clientSecret,
     callbackURL: config.github.callbackURL
   },
   function(accessToken, refreshToken, profile, done) {
   User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) { 
           console.log(err); 
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
   });
 }
 ));
 passport.use(new GoogleStrategy({
     returnURL: config.google.returnURL,
     realm: config.google.realm
   },
   function(accessToken, refreshToken, profile, done) {
   User.findOne({ oauthID: profile.id }, function(err, user) {
     if(err) { console.log(err); }
     if (!err && user != null) {
       done(null, user);
     } else {
       var user = new User({
         oauthID: profile.id,
         name: profile.displayName,
         created: Date.now()
       });
       user.save(function(err) {
         if(err) { 
           console.log(err); 
         } else {
           console.log("saving user ...");
           done(null, user);
         };
       });
     };
   });
 }
 ));
 ```

2. Your "app.js" file should now look like this:

 ```javascript
 // dependencies
 var fs = require('fs');
 var express = require('express');
 var routes = require('./routes');
 var path = require('path');
 var app = express();
 var config = require('./oauth.js')
 var User = require('./user.js')
 var mongoose = require('mongoose')
 var passport = require('passport')
 var auth = require('./authentication.js')

 // connect to the database
 mongoose.connect('mongodb://localhost/passport-example');

 var app = express();

 app.configure(function() {
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.logger());
   app.use(express.cookieParser());
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(express.session({ secret: 'my_precious' }));
   app.use(passport.initialize());
   app.use(passport.session());
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
 });

 // seralize and deseralize
 passport.serializeUser(function(user, done) {
     console.log('serializeUser: ' + user._id)
     done(null, user._id);
 });
 passport.deserializeUser(function(id, done) {
     User.findById(id, function(err, user){
         console.log(user)
         if(!err) done(null, user);
         else done(err, null)  
     })
 });

 // routes
 app.get('/', routes.index);
 app.get('/ping', routes.ping);
 app.get('/account', ensureAuthenticated, function(req, res){
   User.findById(req.session.passport.user, function(err, user) {
     if(err) { 
       console.log(err); 
     } else {
       res.render('account', { user: user});
     }
   })
 })
 app.get('/auth/facebook',
   passport.authenticate('facebook'),
   function(req, res){
   });
 app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/twitter',
   passport.authenticate('twitter'),
   function(req, res){
   });
 app.get('/auth/twitter/callback', 
   passport.authenticate('twitter', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/github',
   passport.authenticate('github'),
   function(req, res){
   });
 app.get('/auth/github/callback', 
   passport.authenticate('github', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/auth/google',
   passport.authenticate('google'),
   function(req, res){
   });
 app.get('/auth/google/callback', 
   passport.authenticate('google', { failureRedirect: '/' }),
   function(req, res) {
     res.redirect('/account');
   });
 app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/');
 });

 // port
 app.listen(1337);

 // test authentication
 function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/')
 }
 ```
 
 Continue to break apart "app.js", like moving your routes to a new file. Once done, test everything out again. Drop the database in mongo shell to ensure that new users are still added.

## Unit Tests

1. Install Mocha:

 ```shell
 $ npm install mocha --save
 $ npm install chai --save
 $ npm install should --save
 ```

2. Update the `scripts` in "package.json"

 ```json
 "scripts": {
   "start": "node app.js",
   "test": "make test"
 },
 ```

3. Add a Makefile and include the following code:

 ```
 test:
	@./node_modules/.bin/mocha

 .PHONY: test
 ```

4. Create a new folder called "tests"

5. Run `make tests` from the command line. If all is setup correctly, you should see - `0 passing (1ms)`.

6. Create a new file called "test.user.js" with the following code and save the file in "tests":

 ```javascript
 var should = require("should");
 var mongoose = require('mongoose');
 var User = require("../user.js");
 var db;

 describe('User', function() {

 before(function(done) {
	 db = mongoose.connect('mongodb://localhost/test');
	   done();
	 });

	 after(function(done) {
	   mongoose.connection.close()
	   done();
	 });

	 beforeEach(function(done) {
	  var user = new User({
      oauthID: 12345,
      name: 'testy',
	    created: Date.now()
	  });

	  user.save(function(error) {
	    if (error) console.log('error' + error.message);
	    else console.log('no error');
	    done();
	   });
	 });

	 it('find a user by username', function(done) {
	    User.findOne({ oauthID: 12345, name: "testy" }, function(err, user) {
	      user.name.should.eql('testy');
	      user.oauthID.should.eql(12345)
	      console.log("		name: ", user.name)
	      console.log("		oauthID: ", user.oauthID)
	      done();
	    });
	 });

	 afterEach(function(done) {
	    User.remove({}, function() {
	      done();
	    });
	 });

	});
  ```
7. Run `make tests`. You should see that it passed- `1 passing (47ms)`.

## Conclustion

Simple, right? Grab the final code [here](https://github.com/mjhea0/passport-examples).

![fb](https://raw.github.com/mjhea0/passport-examples/master/public/img/final.png)


