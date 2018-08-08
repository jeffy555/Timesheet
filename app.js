const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

//apply body-parser

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');
mongoose.connect(config.database);

let db = mongoose.connection;

db.once('open', function(){
  console.log('Database CAKES Connected')
});

db.on('error', function(err){
  console.log(err);
});

let Article = require('./models/articles');
let User = require('./models/user');
let task = require('./models/task')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Express Session Middleware

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

//Express messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware

app.use(expressValidator({
  errorFormatter:  function(param, msg, value){
    var namespace = param.split('.')
    ,root = namespace.shift()
    ,formParam = root;
   while(namespace.length){
     formParam += '[' +  namespace.shift() + ']'
   }
   return {
     param: formParam,
     msg: msg,
     value: value
   };
 }
}));

//passport config


require('./config/passport')(passport);

//passsport Middleware

app.use(passport.initialize());
app.use(passport.session());


//Checking User
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//ROuting to Single articles

app.get('/articles/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render('article', {
        article: article,
        author: user.name
      });
    });

  });

});


app.get('/article/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger');
      res.redirect('/');
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });

});




app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }else{
     res.render('index', {
       title: 'Articles',
       articles: articles
     });
   }
 });
});

app.get('/article/add', ensureAuthenticated, function(req, res){
  res.render('add_articles',{
    title: 'Add Article'

  });
});

//Create Task

app.get('/task/add', ensureAuthenticated, function(req, res){
  res.render('createtask',{

  });
});



app.post('/article/add', function(req, res){

  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('add_articles',{
      title:'Add Article',
      errors:errors
    });
  }else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('Success', 'Article Added');
        res.redirect('/');
      }
    });
  }
});

//Update POST

app.post('/articles/edit/:id', function(req, res){
  let article={}
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  let query={_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });

});

//Delete Articles

app.delete('/article/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send()
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
  });
}
  });
});
//routing the users
let users = require('./routes/users');

//RUoute anything that goes to the users to that file (users)
app.use('/users', users);

app.listen(3000, function(res, req){
  console.log('Initial Connection')

});


//Access control

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
  return next();
} else{
  res.redirect('/users/login');
}
}
