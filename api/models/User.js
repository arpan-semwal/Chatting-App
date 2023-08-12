const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username : {type:String , unique:true},
    password : String,
} , {timestamps: true}); // when it is created

const UserModel = mongoose.model('User' , UserSchema);
module.exports = UserModel;