const express=require("express");
const path=require("path");

const bcrypt=require("bcryptjs");
const cookieParser=require("cookie-parser");
const app=express();
const port=process.env.PORT || 5000;
const authentication=require("./middleware/authentication");
const jwt=require("jsonwebtoken");

require("./db/connection");
const Register=require("./models/registers");

app.use(cookieParser());

const {cloudinary} = require('./utils/cloudinary');

app.use(express.json({limit:'50mb'}));

app.use(express.urlencoded({extended:false}));


app.get("/secret",authentication,async(req,res)=>{
  // const cookie=req.cookies.jwt;
  // console.log(cookie);
  const token=req.cookies.jwt;
    
  const isValid=jwt.verify(token,process.env.SECRET_KEY); //isValid will be id of user document

  const data=await Register.findOne({_id:isValid});
  console.log(data);
  res.status(201).json({status:201,data:data});
  
})
app.post("/upload",async(req,res)=>{
  try{
    const fileStr = req.body.data;
    const uploadedResponse = await cloudinary.uploader.upload(fileStr,{
      upload_preset: 'images'
    })
    console.log(uploadedResponse);
    const data=await Register.findOne({email:req.body.user});
    data.image = uploadedResponse.url;
    data.save();
    res.status(201).json({status:201});
  }catch(err)
  {
    console.log("Image upload error",err);
    res.status(400).json({status:400});
  }
})
app.post("/confirm",async(req,res)=>{
  try{
    const code = req.body.confirmationCode;
    console.log(code);
    const data = await Register.findOne({confirmationCode:code});
    console.log(data);
    if(!data)
    {
      res.status(200).json({status:400,result:"error"});
    }
    else
    {
      if(data.status==="Active")
      {
        res.status(200).json({status:400,result:"Account already active"});
      }
      else
      {
        data.status="Active";
        data.save();
        res.status(200).json({status:201,result:"Account activated"});
      }
    }



  }catch(err){
    console.log(err);
    res.status(400).json({status:400,error:err});
  }

})
app.post("/register",async (req,res)=>{
  try{
    const password=req.body.password;
    const cpassword=req.body.cpassword;
    let status = "Pending";
    if(req.body.status)
    {
      status=req.body.status;
    }
    const data = await Register.findOne({email:req.body.email});
    console.log(data);
    if(data)
    {
      res.status(201).json({status:400,error:"Already a User"});
    }
    else
    {
      if(password===cpassword)
      {
        const employee=new Register({
          fname:req.body.fname,
          lname:req.body.lname,
          email:req.body.email,
          gender:req.body.gender,
          age:req.body.age,
          password:password,
          status:status
        })
        //console.log("here");
        
        // employee.password=await bcrypt.hash(password,10); //maine schema wali file me middleware chala diya h
        const result=await employee.save();
        console.log("end");
        res.status(201).json({status:201,result:"successful"});
      }
      else
      {
        res.json({status:400,error:"passwords are not same"});
      }
    }
  }catch(err){
    console.log(err);
    res.status(400).json({status:400,error:"Already a user"});
  }
})

app.post("/login",async (req,res)=>{
  try{
    const email=req.body.email
    const password=req.body.password;
    const employee= await Register.findOne({email:email});
    const isValid=await bcrypt.compare(password,employee.password);
    
    const token= await employee.createAuthToken();
    console.log(token);

    res.cookie("jwt",token,{
      httpOnly:true,
      expires:new Date(Date.now()+600000),
      // secure:true
    });
    
    if(isValid&&employee.status!=="Pending")
    {
      res.status(201).json({status:201,result:"Login Successful...."})
    }
    else if(isValid&&employee.status==="Pending")
    {
      res.status(201).json({status:400,error:"Please confirm your email first"});
    }
    else
    {
      res.json({status:400,error:"Invalid email or password"});
    }
  }catch(err)
  {
    res.json({status:400,error:"Invalid email or password"})
  }
})

app.get("/logout",authentication,async (req,res)=>{
  try {
    res.clearCookie("jwt");

    // // logout from single device
    // console.log("logout successful....");
    // req.data.tokens=req.data.tokens.filter((element)=>{
    //   return element.token!=req.token;
    // })

    //logout from all devices
    console.log("logout from all devices successful");
    req.data.tokens=[];

    console.log(req.data);
    await req.data.save();
    res.status(201).json({status:201});
  } catch (error) {
    res.status(400).json({status:400,error:error});
  }
})

app.listen(port,()=>{
  console.log(`listening at port number ${port}`);
})