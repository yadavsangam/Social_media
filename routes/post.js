const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/socialmedia');

var postModel = mongoose.Schema({
  name:String,
  post:String,
  date:{
      type: Date,
      default:new Date
  },
  likes:[]
 
})


module.exports = mongoose.model('post', postModel);