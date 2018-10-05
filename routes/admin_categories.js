var express=require("express")
var app=express.Router()
var Category=require("../models/category")
app.get("/",function(req,res){
    Category.find(function (err, categories) {
        if(err)
        return console.log(err)
        res.render('admin/categories', {
            categories: categories
        });
})
})

app.get("/add-category",function(req,res){
    var title="";
    
    res.render("admin/add_category",{
        title:title
    })
})

app.post("/add-category",function(req,res){
    var slug=null;
    req.checkBody("title","Title must have a value").notEmpty();
    var title=req.body.title;
    if(req.body.slug)
    {
        //console.log(req.body.slau)
    slug=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    }
    if(req.body.title){
        //console.log(req.body.title)
    if(slug==null) 
    slug=title.replace(/\s+/g,'-').toLowerCase();
    }
    var errors=req.validationErrors();
    if(errors)
    {
        res.render("admin/add_category",{
            errors:errors,
        title:title
    })
    }
    else
    {
        Category.findOne({slug:slug},function(err,category){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/pages/add-page")
            }
            else
            {
                if(category){
                    req.flash('danger','Category title already exists,choose another')
                     res.render("admin/add_category",{
                        title:title
                    })
                }
                else{
                    var page1= new Category({
                        title:title,
                        slug:slug
                    });
                    page1.save(function(err){
                        if(err)
                        console.log(err)
                        else{
                            Category.find(function (err, categories) {
                            if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;;
                        }
                    });
                        req.flash('success','Category added')
                        res.redirect('/admin/categories')
                            
                        }
                    })
                    
                }
            }
        })
    }
})



app.get("/edit-category/:id",function(req,res){
    Category.findById(req.params.id,function(err,category){
        if(err) return console.log(err) 
        res.render("admin/edit_category",{
        title:category.title,
        id:category._id 
    })
        
    })
    
    
})

app.post("/edit-category/:id",function(req,res){
    var slug=null;
    req.checkBody("title","Title must have a value").notEmpty();
    var title=req.body.title;
    if(req.body.slug)
    {
        //console.log(req.body.slau)
    slug=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    }
    if(req.body.title){
        //console.log(req.body.title)
    if(slug==null) 
    slug=title.replace(/\s+/g,'-').toLowerCase();
    }
    var id=req.params.id
    var errors=req.validationErrors();
    if(errors)
    {
        res.render("admin/edit_category",{
            errors:errors,
        title:title,
        id:id
    })
    }
    else
    {
        //console.log("slug is"+slug)
        Category.findOne({slug:slug,_id:{'$ne':id}},function(err,category){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/pages/add-category")
            }
            else
            {
                if(category){
                    req.flash('danger','Category already exists,choose another')
                     res.render("admin/add_category",{
                        title:title,
                        id:id
                    })
                }
                else{
                    Category.findById(id,function(err,page1){
                        if(err) return console.log(err)
                        page1.title=title
                        page1.slug=slug
                    
                    page1.save(function(err){
                        if(err)
                        console.log(err)
                        else{
                            Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;;
                            }
                        });
                        req.flash('success','Category added')
                        res.redirect('/admin/categories')
                            
                        }
                    })
                    })
                    
                }
            }
        })
    }
})

app.get("/delete-category/:id",function(req,res){
    Category.findByIdAndRemove(req.params.id,function(err){
        if(err)  return console.log(err)
        Category.find(function (err, categories) {
        if (err) {
        console.log(err);
        } else {
        req.app.locals.categories = categories;;;
        }
});
        req.flash('success','Category deleted')
        res.redirect('/admin/categories/')
    })
})


module.exports=app;