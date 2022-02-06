const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/socialmedia');

var userSchema = mongoose.Schema({
  name:String,
  username:String,
  password:String,
  phoneNumber:Number,
  city:String,
  profile_pic:{
    type: String,
    default: './images/uploads/image.png'
  },
  posts:Array
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);