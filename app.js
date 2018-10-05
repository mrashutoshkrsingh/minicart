var express=require("express");
var path=require("path")
var mongoose=require("mongoose");
var keys=require("./config/keys")
var bodyParser = require("body-parser");
var session = require('express-session')
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');
var passport = require('passport');
//connect database
mongoose.connect(keys.database,{useNewUrlParser:true})

//init app
var app=express()
 
//view engine setup
  //app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

//public forlder
app.use(express.static("public"))
    //app.use(express.static(path.join(__dirname,'public')))

//global variable
app.locals.errors=null;

var Page = require('./models/pages');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs


//body-parser
app.use(bodyParser.urlencoded({extended: true})); 
// parse application/json
app.use(bodyParser.json())

// Express fileUpload middleware
app.use(fileUpload());

//express-middleware
app.use(session({
  secret: 'Dhoni is my favourite',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//connect flash
app.use(flash())

//express-messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next) {
   res.locals.cart = req.session.cart;
   res.locals.user = req.user || null;
   Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

   next();
});
//set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/user.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);


app.listen(process.env.PORT,process.env.ID,function(){
    console.log("Server started");
})