/* required modules */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Fuse = require('fuse.js');    // search

/* deployment */
const HTTP = require('http');
const HTTPS = require('https');
const fs = require('fs');

/* login */
const bcrypt = require('bcryptjs');
const sessionsModule = require('client-sessions');
const secrets = require('./secrets.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('./public'));

/* sessions */
const sessionseMiddleware = sessionsModule({
    cookieName: 'drills_login',
    secret: secrets.cookieSecret,
    requestKey: 'session',
    duration: 86400 * 1000 * 7,
    cookie: {
        httpOnly: true,
        secure: false,
    }
});
app.use(sessionseMiddleware);

/* database stuffz */
/*
mongoose.connect('mongodb://localhost:27017/laxdrills', //{useMongoClient:true},
{ useNewUrlParser: true },
{ useUnifiedTopology: true },
 function(mongooseErr) {
  if(mongooseErr) { console.log('mongoose error: ' + mongooseErr); }
  else { console.log('mongoose ACTIVAAAATE!'); }
})
mongoose.Promise = global.Promise
*/
/* user data */
const UserSchema = new mongoose.Schema({
  username: {
    type:     String,
    required: true,
    unique:   true,
  },
  password: {
    type:     String,
    required: true,
  },
  created: {
    type:     Date,
    default:  function(){ return new Date(); }
  },
})
const User = mongoose.model('User', UserSchema);

const DrillSchema = new mongoose.Schema({
    id: {
        type:     String,
        required: true,
        unique:   true,
    },
    type: {
        type:     String,
        required: true
    }
});
let DrillModel = mongoose.model('drill', DrillSchema);

/* separate DB for testing */
const DrillModelTest =
mongoose.model('test_drill_model', DrillSchema);

/* authentication stuff */
let checkIfLoggedIn = function(req,res,next) {
  if(req.session._id) {
    console.log('user is logged in. proceeding to the next route handler.');
    next();
  }
  else { res.redirect('/'); }
}

/* authentication middleware */
app.use(function(req,res,next) {
  console.log('session?', req.session);
  // res.sendFile('./public/html/index.html', {root:'./'})
  next();
});

/* routes */
app.get('/', function(req,res) {
  res.sendFile('./public/html/index.html', {root:'./'})
});

app.get('/search', function(req,res) {
  res.sendFile('./public/html/search.html', {root:'./'})
});

app.post('/searchType', function(req,res) {
    let search_string = req.body.type;

    let options = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "type",
        ]
    }

    DrillSchema.find({}, function(err,docs) {
        if(err) { console.log('DrillSchema.find() error: ' + err); }
        else {
          console.log('DrillSchema.find() docs: ' + docs);

          let fuse = new Fuse(docs, options); // "list" is the item array
          let result = fuse.search(search_string);

          console.log('title search result --- ', result);

          res.send(result);
        }
    });
});

app.post('/searchId', function(req,res) {
    let search_string = req.body.id;

    let options = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "id",
        ]
    }

    DrillSchema.find({}, function(err,docs) {
        if(err) { console.log('DrillSchema.find() error: ' + err); }
        else {
          console.log('DrillSchema.find() docs: ' + docs);

          let fuse = new Fuse(docs, options); // "list" is the item array
          let result = fuse.search(search_string);

          console.log('title search result --- ', result);

          res.send(result);
        }
    });
});

app.get('/about', function(req,res) {
  res.sendFile('./public/html/about.html', {root:'./'})
});

/* logging users in and out */
app.post('/register', function(req,res) {
  var newUser = new User(req.body)
  bcrypt.genSalt(11, function(saltErr,salt) {
    if(saltErr) {console.log(saltErr)}

    bcrypt.hash(newUser.password, salt, function(hashErr, hashedPassword) {
      if(hashErr) {console.log(hashErr)}
      newUser.password = hashedPassword
      newUser.save(function(err) {
        if(err) {
          console.log('failed to save user')
          res.send(err)
        } else {
          req.session._id = newUser._id
          res.send({success:'success!'})
        }
      })
    })
  })
});

app.get('/login', function(req,res) {
  res.sendFile('./public/html/login.html', { root:'./' });
})

app.post('/login', function(req,res) {
    console.log('login req.body: ' + req.body);
    let uname = req.body.username;
    let pass = req.body.password;

    User.findOne({username:uname}, function(err,user) {
      if(err) {
        console.log('failed to find user')
        res.send({failure:'failure'})
      }
      else if(!user) { res.send({failure: 'failure'}); }
      else {
        bcrypt.compare(pass, user.password, function(bcryptErr,matched) {
            if(bcryptErr) {
                console.log('bcrypt err --- ', bcryptErr)
                res.send({failure: 'failure'})
            }
            else if(!matched) {
                console.log(`wrong username/password`)
                res.send({failure:'failure'})
            }
            else if(matched) {
                req.session._id = user._id
                res.send({success:'success'})
            }
        })
      }
    })
});

app.get('/logout', function(req,res) {
  req.session.reset();
  res.redirect('/login');
});

/* -=-=-=-=-=-=-=-=-=-=-=-=-=- */
app.use(function(req,res,next) {
  res.status(404);
  res.send(`that's a 404 error, yo.`);
});

try {
      const httpsConfig = {
        key: fs.readFileSync('/etc/letsencrypt/live/laxdrills.app/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/laxdrills.app/cert.pem'),
      }

      const httpsServer = HTTPS.createServer(httpsConfig, app);
      httpsServer.listen(443);

    const httpApp = express();
    httpApp.use(function(req,res,next) {
        res.redirect('https://laxdrills.app' + req.url);
    });
    httpApp.listen(80);
}
catch(e) {
    console.log('server error: ' + e);
    console.log('could not start HTTPS server');
    
    const httpServer = HTTP.createServer(app);
    httpServer.listen(8080);
}

// app.listen(8080, function() {
//   console.log('running on 8080')
// })
