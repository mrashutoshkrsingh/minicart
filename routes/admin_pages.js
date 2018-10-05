var express=require("express")
var app=express.Router()
var Page=require("../models/pages")
app.get("/",function(req,res){
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        if(err)
        console.log(err)
        res.render('admin/pages', {
            pages: pages
        });
})
})

app.get("/add-page",function(req,res){
    var title="";
    var slug="";
    var content="";
    
    res.render("admin/add_page",{
        title:title,
        slug:slug,
        content:content
    })
})

app.post("/add-page",function(req,res){
    var slug=null;
    req.checkBody("title","Title must have a value").notEmpty();
    req.checkBody("content","Content must have a value").notEmpty();
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
    var content=req.body.content;
    var errors=req.validationErrors();
    if(errors)
    {
        res.render("admin/add_page",{
            errors:errors,
        title:title,
        slug:slug,
        content:content
    })
    }
    else
    {
        Page.findOne({slug:slug},function(err,page){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/pages/add-page")
            }
            else
            {
                if(page){
                    req.flash('danger','Page slug already exists,choose another')
                     res.render("admin/add_page",{
                        title:title,
                        slug:slug,
                        content:content
                    })
                }
                else{
                    var page1= new Page({
                        title:title,
                        slug:slug,
                        content:content,
                        sorting:100
                    });
                    page1.save(function(err){
                        if(err)
                        console.log(err)
                        else{
                            Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
                        req.flash('success','page added')
                        res.redirect('/admin/pages')
                            
                        }
                    })
                    
                }
            }
        })
    }
})

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}


app.post('/reorder-pages',function(req,res){
    var ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

})

app.get("/edit-page/:id",function(req,res){
    Page.findById(req.params.id,function(err,page){
        if(err) return console.log(err) 
        res.render("admin/edit_page",{
        title:page.title,
        slug:page.slug,
        content:page.content,
        id:page._id 
    })
        
    })
    
    
})

app.post("/edit-page/:id",function(req,res){
    var slug=null;
    req.checkBody("title","Title must have a value").notEmpty();
    req.checkBody("content","Content must have a value").notEmpty();
    var title=req.body.title;
    if(req.body.slug!=null)
    {
        //console.log(req.body.slau)
    slug=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    }
    if(req.body.title!=null){
        //console.log(req.body.title)
    if(slug==null) 
    slug=title.replace(/\s+/g,'-').toLowerCase();
    }
    var content=req.body.content;
    var id=req.params.id
    var errors=req.validationErrors();
    if(errors)
    {
        res.render("admin/edit_page",{
            errors:errors,
        title:title,
        slug:slug,
        content:content,
        id:id
    })
    }
    else
    {
        //console.log("slug is"+slug)
        Page.findOne({slug:slug,_id:{'$ne':id}},function(err,page){
            if(err){
                console.log(err)
                req.flash('danger',err)
                res.redirect("/admin/pages/add-page")
            }
            else
            {
                if(page){
                    req.flash('danger','Page slug already exists,choose another')
                     res.render("admin/add_page",{
                        title:title,
                        slug:slug,
                        content:content,
                        id:id
                    })
                }
                else{
                    Page.findById(id,function(err,page1){
                        if(err) return console.log(err)
                        page1.title=title
                        page1.slug=slug
                        page1.content=content 
                    
                    page1.save(function(err){
                        if(err)
                        console.log(err)
                        else{
                            Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
                        req.flash('success','page added')
                        res.redirect('/admin/pages')
                            
                        }
                    })
                    })
                    
                }
            }
        })
    }
})

app.get("/delete-page/:id",function(req,res){
    Page.findByIdAndRemove(req.params.id,function(err){
        if(err)  return console.log(err)
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        req.flash('success','page deleted')
        res.redirect('/admin/pages/')
    })
})


module.exports=app;