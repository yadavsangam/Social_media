const express = require('express');
const router = express.Router();
const User = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const postModel = require('./post');
var fs = require('fs');
const multer = require('multer');


passport.use(new localStrategy(User.authenticate()));


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var d = new Date();
    d = d.getTime();
    var name = d + file.originalname;
    cb(null, name)
  }
})

function fileFilter(req, file, cb){
  if(file.mimetype ==='image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
  cb(null, true);
} else {
  cb(new Error('such file not supported !'));
 }
}
 
var upload = multer({ storage: storage, fileFilter: fileFilter, limits: {fileSize: 419430894}})

router.post('/uploadsprofilePic', isLoggedIn, upload.single('file'), function (req, res) {
  var path = './images/uploads/' + req.file.filename;
  
  User.findOne({ username: req.session.passport.user })
    .then(function (founduser) {
      if (founduser.profile_pic === './images/uploads/image.png') {
        founduser.profile_pic = path;
        founduser.save()
          .then(function (dpupdated) {
            res.redirect('/profile')
          })
      }
      else{
        fs.unlink("./public/"+founduser.profile_pic, function(err){
          if(err) throw err;
        })  
            founduser.profile_pic=path;
            founduser.save()
            .then(function(val){
              res.redirect('/profile');    
      })
    }
  })
})


router.get('/profile',isLoggedIn,function(req, res) {
  User.findOne({username:req.session.passport.user})
    .then(function(userfound){      
        postModel.find()
      .then(function(allPost){
        res.render('profile',{isLoggedIn: true, username: req.session.passport.user,data:userfound, post: allPost})      
    })
  })
});



/* GET home page. */
router.get('/', function(req, res) {
  if(req.isAuthenticated()){
    res.render('index', { isLoggedIn :true, username: req.session.passport.user });
  }
  else{
    res.render('index', { isLoggedIn :false });
  }
});

router.get('/signup', function(req, res) {
  res.render('signup', { isLoggedIn :false });
});

router.post('/signup',function(req,res){
  var detailswithoutpassword = new User({
    name:req.body.name,
    username:req.body.username,
    city:req.body.city,
    phnumber:req.body.phnumber
  })
  User.register(detailswithoutpassword, req.body.password)
  .then(function(userRegistered){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    })
  })
})


router.post('/login',passport.authenticate('local',
{successRedirect:'/profile',
failureRedirect:'/'
}),function(req,res,next){});

router.get('/logout',function(req, res) {
  req.logOut();
  res.redirect('/');   
 });


router.post('/createpost',isLoggedIn,function(req,res,next) {
  User.findOne({username:req.session.passport.user})
  .then(function(userfound){
    postModel.create({
      name:req.session.passport.user,
      post:req.body.post
    }).then(function(createdPost){
      res.redirect('/profile');
    })
  })
});


router.get('/like/:id',isLoggedIn,function(req,res,next){
  postModel.findOne({_id:req.params.id})
  .then(function(woPost){
   if(woPost.likes.indexOf(req.session.passport.user) === -1){
     woPost.likes.push(req.session.passport.user);
   }
   else{
     let indexOfDislike = woPost.likes.indexOf(req.session.passport.user);
     let copy = woPost.likes;
     copy.splice(indexOfDislike, 1);
     woPost.likes = copy;
   }
   woPost.save(function(){
     res.redirect('/profile');
   })
  }).catch(function(err){
    res.send(err);
  })
});


 
function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/');
  }
}

router.get('/finduser/:username', function(req, res){
  User.findOne({username: req.params.username})
  .then(function(foundUser){
    res.json(foundUser);
  })
})

module.exports = router;
