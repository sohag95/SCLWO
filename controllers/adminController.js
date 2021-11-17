const Admin = require("../models/Admin")


exports.adminHome = function (req, res) {
  res.render('admin-home',{
    regErrors: req.flash("regErrors")
  })
}

exports.adminMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.accountType == "admin") {
    next()
  } else {
    req.flash("errors", "You must be logged in as admin to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}


exports.uploadSlidePicture = function (req, res) {
  let data = req.body
  let file = req.files.file
  let filePath = "public/images/" + req.body.slidePicNumber + ".jpg"
  Admin.uploadingSlidePicture(filePath, file, req.body.slidePicNumber)
    .then(msg => {
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(err => {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}