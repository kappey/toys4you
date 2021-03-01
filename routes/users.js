const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {UserModel, validUser, genToken, validSignIn} = require("../models/userModel");
const {authToken} = require("../middleware/auth");
const { json } = require("express");

const router = express.Router();

router.get('/myinfo', authToken ,async(req,res) => {
  try{
    let user = await UserModel.findOne({_id:req.userData._id},{__v:0, password:0});
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


router.post('/signUp', async(req,res) => {
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = new UserModel(req.body);
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.status(201).json(_.pick(user,["_id", "user", "email", "date_created"]))
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


router.post('/signIn',async(req,res) => {
  let validBody = validSignIn(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = await UserModel.findOne({email:req.body.email});
    if(!user){
      return res.status(400).json({msg:"user or password is invalid"});
    }
    let validPassword = await bcrypt.compare(req.body.password,user.password);
    if(!validPassword){
      return res.status(400).json({msg:"user or password is invalid"});  
    }
    let userToken = genToken(user._id);
    res.json({token:userToken});
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
