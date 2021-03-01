const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {config} = require("../config/secretData");

let userSchema = new mongoose.Schema({
    user:String,
    email:String,
    password:String,
    role:{
        type:String,default:"regular"
      },
    date_created:{
        type:Date, default:Date.now
    }
})

exports.UserModel = mongoose.model("users",userSchema);

exports.genToken = (_id) => {
    let token = jwt.sign({_id},config.jwtSecret,{expiresIn:"60mins"});
    return token;
  }

exports.validUser= (_userBody) => {
    let JoiSchema = Joi.object({
        user:Joi.string().min(3).max(200).required(),
        email:Joi.string().min(10).max(100).email().required(),
        password:Joi.string().min(3).max(200).required(),
        role:Joi.string().min(3).max(10)
    })

    return JoiSchema.validate(_userBody);
}

exports.validSignIn = (_userBody) => {
      let joiSchema = Joi.object({
        email:Joi.string().min(10).max(100).email().required(),
        password:Joi.string().min(3).max(200).required(),
      })
  
      return joiSchema.validate(_userBody);
    }