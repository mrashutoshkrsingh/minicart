exports.isUser = function(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      req.flash('danger', 'Please log in.');
      res.redirect('/users/login');
  }
}

exports.isAdmin = function(req, res, next) {
  if(req.isAuthenticated()){
    console.log("1"+res.locals.user)
    console.log(res.locals.user.admin)
  if (res.locals.user.admin == 1) {
      next();
  } else {
      req.flash('danger', 'Please log in as admin.');
      res.redirect('/users/login');
  }}
  else {
    req.flash('danger', 'Please log in as admin');
    res.redirect('/users/login');
}
}
