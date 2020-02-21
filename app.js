const express = require('express')
let path = require('path');
const app = express()
const PORT = process.env.PORT || 8000
const bodyParser = require("body-parser")
const fs = require("fs");
let mongoose = require("mongoose");
let expressValidator = require('express-validator');
let flash = require('connect-flash');
let session = require('express-session');
let passport = require('passport');
let config = require('./config/database.js');
let bcrypt = require('bcryptjs');
let date = require('date-and-time');
let now = new Date();
let gm = require('gm').subClass({ imageMagick: true });
let FroalaEditor = require('./lib/froalaEditor.js');
let multer = require('multer');


// app.use(multer);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/"));
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.set('useFindAndModify', false);

// ////////////////////////////////////////

mongoose.connect(config.database);
let db = mongoose.connection;


app.locals.moment = require('moment');

db.once('open', function () {
  console.log('connected to mongodb');
})



////////////////////////////////////////


let User = require('./models/user.js');
let Profile = require('./models/profile.js');
let Artical = require('./models/artical.js');

////////////////////////////////////////


// app.use(multer({ dest: 'uploadsimage/' }).any())
var upload = multer({ dest: 'uploadsimage/' })

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



////////////////////////////////////////

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
//////////connect-flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-message')(req, res);
  next();
});

/////////expressValidator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));


////Passport 
require('./config/passport.js')(passport);
///passport Midd
app.use(passport.initialize());
app.use(passport.session())


////////////////////////////////////////

app.get('*', function (req, res, next) {
  console.log(req.user);
  res.locals.user = req.user || null;
  next();
});

app.get("/index", function (req, res) {
  Artical.find({ status: "1" }, function (err, artical) {
    if (err) {
      console.log(err);
    } else; {

      res.render("home/index.ejs", {
        all_artical: artical
      });

    }
  })

});


app.get("/", function (req, res) {
  Artical.find({ status: "1" }, function (err, artical) {
    if (err) {
      console.log(err);
    } else; {

      res.render("home/index.ejs", {
        all_artical: artical
      });

    }
  })

});

app.get("/write", function (req, res) {

  res.render("write/writer.ejs");
});

app.get("/edit/:id", function (req, res) {
  id_artical = req.params.id
  Artical.findById(req.params.id, function (err, artical) {
    if (err) {
      console.log(err);
    } else {
      res.render("write/edit.ejs", {
        artical_: artical
      });

    }
  })



});




app.get("/mywrite", function (req, res) {
  let id = req.user._id;
  console.log(id);
  Artical.find({ 'author': id }, function (err, articals) {
    if (err) {
      console.log(err);
    } else; {
      console.log(articals)

      res.render("my_artical/mywriter.ejs", {
        artical: articals
      });
    }
  })


});


app.get("/regis", function (req, res) {

  res.render("nav/regis.ejs");
});



app.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: './index',
    failureRedirect: './index',
    failureFlash: true
  })(req, res, next);
});


app.post('/user/add', function (req, res) {
  let user = new User();
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;

  console.log(username)

  req.checkBody('username', 'username name is required').notEmpty();
  req.checkBody('name', 'name  is required').notEmpty();
  req.checkBody('password', 'password  is required').notEmpty();

  let errors = req.validationErrors();


  if (errors) {

    res.status(400).send({ "message": "Missing parameter" });

  } else {
    let newUser = new User({
      name: username,
      password: password
    });

    let newProfile = new Profile({
      name: name,
      user_id: newUser._id
    });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newUser.password, salt, function (err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.username = username;
        newUser.password = hash;
        newUser.save(function (err) {
          if (err) {
            console.log(err);
            return;
          } else {
            newProfile.save(function (err) {
              if (err) {
                console.log("err");
                return;
              } else {
                req.flash('success', 'You can loig in');
                res.redirect('../index');
              }


            });
          }
        });
      });
    });
  }

});


app.get("/logout", function (req, res) {
  req.logout();
  req.flash('success', 'You are logged out ');
  res.redirect('./index');
});

app.post("/submit_artical", upload.single('imgInp'), function (req, res) {
  let errors = req.validationErrors();
  let img = req.file.path;
  if (errors) {
    res.status(400).send({ "message": "Missing parameter" });
  } else {
    let artical = new Artical();
    artical.title = req.body.title_create;
    artical.img_pro = img;
    artical.author = req.user._id;
    artical.type = req.body.search_type;
    artical.body = req.body.egpreviewer;
    artical.short_text = req.body.short_text;

    artical.date = date.format(now, 'YYYY/MM/DD');
    artical.status =req.body.state;
    

    if (req.body.recomment == null) {
      artical.recomment = "0"
    } else {
      artical.recomment = "1"
    }
    // console.log(artical)
    artical.save(function (err) {
      if (err) {
        return;
      } else {
        req.flash('success', 'Thread Added');
        res.redirect('/mywrite');
      }
    });
  }
})

app.post("/update_artical/:id", function (req, res) {
  id_artical = req.params.id
  let errors = req.validationErrors();

  if (errors) {
    res.status(400).send({ "message": "Missing parameter" });
  } else {
    let recomment = "0"
    if (req.body.recomment == null) {
      recomment = "0"
    } else {
      recomment = "1"
    }

    Artical.findByIdAndUpdate({ _id: id_artical }, {
      $set: {
        title: req.body.title_create,
        author: req.user._id,
        type: req.body.search_type,
        body: req.body.egpreviewer,
        date: date.format(now, 'YYYY/MM/DD'),
        short_text : req.body.short_text,
       status  : req.body.state,
        recomment: recomment,

      }
    }, function (err) {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'Thread Added');
        res.redirect('/mywrite');
      }
    });
  }

})





app.post('/upload_image', function (req, res) {

  FroalaEditor.Image.upload(req, '/uploads/', function (err, data) {

    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

app.post('/upload_video', function (req, res) {

  FroalaEditor.Video.upload(req, '/uploads/', function (err, data) {

    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});




app.post('/upload_file', function (req, res) {

  var options = {
    validation: null
  }

  FroalaEditor.File.upload(req, '/uploads/', options, function (err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    res.send(data);
  });
});


app.post('/delete_image', function (req, res) {

  FroalaEditor.Image.delete(req.body.src, function (err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});
app.post('/delete_video', function (req, res) {

  FroalaEditor.Video.delete(req.body.src, function (err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});

app.post('/delete_file', function (req, res) {

  FroalaEditor.File.delete(req.body.src, function (err) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});

app.get('/load_images', function (req, res) {

  FroalaEditor.Image.list('/uploads/', function (err, data) {

    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    return res.send(data);
  });
});


// Create folder for uploading files.
var filesDir = path.join(path.dirname(require.main.filename), 'uploads');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}


app.post('/get_artical', function (req, res) {
  Artical.findById(req.body.id_articals, function (err, artical_find) {
    if (err) {
    } else {
      console.log(artical_find);
      return res.send(artical_find);
    }
  })
});





app.delete('/delete_artical/:id', function(req, res) {
  let query = { _id: req.params.id }

  Artical.remove(query, function(err) {
      if (err) {
          console.log(err);
      }
      res.send('Success');
  });
});




app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`)
})

module.exports = app

// console.log("ddd")

