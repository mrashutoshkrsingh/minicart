var express=require("express")
var app=express.Router()
var mkdirp=require("mkdirp")
var fs=require("fs-extra")
var resizeImg=require("resize-img")

var Product=require("../models/product")

var Category = require('../models/category');


app.get("/",function(req,res){
    var count;

    Product.count(function (err, c) {
        if(err)  return  console.log(err)
        count = c;
    });

    Product.find(function (err, products) {
        if(err)  return  console.log(err)
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
})

app.get("/add-product",function(req,res){
    var title="";
    var desc="";
    var price="";
    
    Category.find(function(err,cats){
        if(err) throw console.log(err)
        res.render("admin/add_product",{
        title:title,
        desc:desc,
        categories:cats,
        price:price
    })
    })
})

app.post("/add-product",function(req,res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;   
    var errors=req.validationErrors();
    if(errors)
    {
        Category.find(function (err, categories) {
            if(err)
            throw console.log(err)
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    }
    else
    {
        Product.findOne({slug: slug},function(err,product){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/products/add-product")
            }
            else
            {
                if(product){
                    Category.find(function (err, categories) {
                        if(err)
                        throw console.log(err)
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
                }
                else{
                    var price2 = parseFloat(price).toFixed(2);
                    var product1 = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                    product1.save(function(err){
                        if(err)
                        return console.log(err)
                        
                        mkdirp('public/product_images/' + product1._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product1._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product1._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });
                    
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product1._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    
                    
                        
                            
                        req.flash('success','product added')
                        res.redirect('/admin/products')
                            
                        
                    })
                    
                }
            }
        })
    }
})



app.get("/edit-product/:id",function(req,res){
    
    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;
    
    Category.find(function (err, categories) {
        if(err)
        return console.log(err)

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });

    });
    
    
})

app.post("/edit-product/:id",function(req,res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    var errors=req.validationErrors();
    if(errors)
    {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    }
    else
    {
        //console.log("desc is"+desc)
        Product.findOne({slug:slug,_id:{'$ne':id}},function(err,product){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/products/add-product")
            }
            else
            {
                if(product){
                    req.flash('danger','Product title already exists,choose another')
                     res.redirect('/admin/products/edit-product/' + id);
                }
                else{
                    Product.findById(id,function(err,p){
                        p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save(function(err){
                        if(err)
                        console.log(err)
                        else{
                        
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                            
                        }
                    })
                    })
                    
                }
            }
        })
    }
})

app.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});


app.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

app.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});


module.exports=app;