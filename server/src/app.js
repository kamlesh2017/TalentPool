const express=require("express");
const path=require("path");
require("dotenv").config();

const bcrypt=require("bcryptjs");
const cookieParser=require("cookie-parser");
const app=express();
const port=process.env.PORT || 5000;
const authentication=require("./middleware/authentication");
const nodemailer = require("nodemailer");
const jwt=require("jsonwebtoken");

require("./db/connection");
const Register=require("./models/registers");
const Categories=require("./models/categories")

app.use(cookieParser());

const {cloudinary} = require('./utils/cloudinary');

app.use(express.json({limit:'50mb'}));

app.use(express.urlencoded({extended:false}));



app.post("/categories",async(req,res)=>{
  try
  {
    const data = await Categories.find();
    var arr = [];
    for(var i=0;i<data.length;i++)
    {
      arr = arr.concat(data[i].name);
    }
    res.status(201).json({status:201,arr:arr});
  }
  catch(err)
  {
    res.status(201).json({status:400});
  }
})


app.post("/handleVote",async(req,res)=>{
  try{
    console.log("at server");
    const userId = req.body.userId;
    const postId = req.body.postId;
    const vote = req.body.vote;
    const postUserId = req.body.postUserId;
    const data = await Register.findOne({_id:postUserId});
    const posts = data.posts;
    var idx=-1;
    for(var i=0;i<posts.length;i++)
    {
      if(posts[i]._id==postId)
      {
        idx=i;
        break;
      }
    }
    var n = posts[idx].votes.length;
    var idx2=-1;
    for(var i=0;i<n;i++)
    {
      if(posts[idx].votes[i].id==userId)
      {
        idx2=i;
        break;
      }
    }
    if(idx2==-1)
    {
      posts[idx].votes = posts[idx].votes.concat({id:userId,vote:vote});
    }
    else
    {
      posts[idx].votes[idx2].vote = vote;
    }
    data.posts = posts;
    await data.save();
    res.status(201).json({status:201,data:posts[idx]});
  }
  catch(err)
  {
    console.log(err);
    res.status(201).json({status:400});
  }
})

app.post("/getProfile",async(req,res)=>{
  try{
    const username = req.body.username;
    const data = await Register.findOne({username:username});
    console.log(data.posts);

    var posts = [];
    
    let flag=true;
    let name = data.fname+" "+data.lname;
    let photo = data.image;
    let postUserId = data._id;
    
    if(flag)
    {
      for(let j=data.posts.length-1;j>=0;j--)
      {
        console.log("inside loop");
        let obj = data.posts[j];
        let obj1={
          _id: obj._id,
          username:username,
          date: obj.date,
          caption: obj.caption,
          type: obj.type,
          url: obj.url,
          category: obj.category,
          votes: obj.votes,
          name:name,
          photo:photo,
          postUserId:postUserId,
          image:data.image,
          fname:data.fname,
          lname:data.lname,
          gender:data.gender,
          age:data.age,
          email:data.email
        }
        
        console.log(obj1);
        posts = posts.concat(obj1);
        
      }
    }
    console.log("again data");
    console.log(data);


    res.status(201).json({status:201,data:data,posts:posts});
  }
  catch(err)
  {
    console.log(err);
    res.status(201).json({status:400});
  }
})


app.post("/viewTalent",async(req,res)=>{
  try{
    const category = req.body.category;
    const data = await Register.find();
    var posts = [];
    for(let i=0;i<data.length;i++)
    {
      let flag=false;
      let name = data[i].fname+" "+data[i].lname;
      let photo = data[i].image;
      let postUserId = data[i]._id;
      let username = data[i].username;
      let len1=data[i].postCategories.length;
      for(let j=0;j<len1;j++)
      {
        if(data[i].postCategories[j].category===category)
        {
          flag=true;
          break;
        }
      }
      if(flag)
      {
        for(let j=data[i].posts.length-1; j>=0;j--)
        {
          if(data[i].posts[j].category===category)
          {
            let obj = data[i].posts[j];
            let obj1={
              _id: obj._id,
              username:username,
              date: obj.date,
              caption: obj.caption,
              type: obj.type,
              url: obj.url,
              category: obj.category,
              votes: obj.votes,
              name:name,
              photo:photo,
              postUserId:postUserId
            }
            
            console.log(obj1);
            posts = posts.concat(obj1);
          }
        }
      }
    }
    posts.sort((a, b) => {
      return b.votes.length - a.votes.length;
    });
    res.status(201).json({status:201,posts:posts});
    //console.log(posts);
  }catch(err)
  {
    console.log(err);
    res.status(400).json({status:400});
  }
})



app.post("/hireUser",async(req,res)=>{
  try{
    const subject = req.body.subject;
    const content = req.body.content;
    const username = req.body.username;
    const HRemail = req.body.HRemail;
    const data = await Register.findOne({username:username});
    const userEmail = data.email;
    
    const user = process.env.USER;
    const pass = process.env.PASSWORD;
    
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });
    transport.sendMail({
      from: user,
      to: userEmail,
      subject: subject,
      html: `<h3>Hello ${data.fname}</h3>
          <p>Someone from our platform with email as ${HRemail} wants to contact you for the hiring process</p>
          <p style="font-weight:bold;">Following is the content sent by hiring person:-</p>
          <p>${content}</p>

          <p style="font-size:10px;color:grey;">For any kind of fraud, we are not responsible</p>
          `,
    }).catch(err => console.log(err));

    res.status(201).send({status:201});

  }
  catch(err)
  {
    console.log(err);
    res.status(201).json({status:400});
  }
})


app.post("/uploadTalent",async(req,res)=>{
  try{
    const fileStr = req.body.data;
    let resource_type = "raw";
    if(req.body.type==="Image")
    {
      resource_type="image";
    }
    if(req.body.type==="Audio"||req.body.type==="Video")
    {
      resource_type="video";
    }
    
    const uploadedResponse = await cloudinary.uploader.upload(fileStr,{
      upload_preset: 'tp-images',
      resource_type: resource_type
    })
    console.log(uploadedResponse);
    const data = await Register.findOne({email:req.body.user});
    //console.log(data);

    data.posts = data.posts.concat({date:new Date(),caption:req.body.caption,type:req.body.type,url:uploadedResponse.url,category:req.body.category});
    //console.log(data);
    let len = data.postCategories.length;
    let flag=false;
    console.log(len);
    for(let i=0;i<len;i++)
    {
      if(data.postCategories[i].category===req.body.category)
      {
        data.postCategories[i].count++;
        flag=true;
        break;
      }
    }
    if(!flag)
    {
      data.postCategories = data.postCategories.concat({category:req.body.category,count:1});
    }
    const resp = await data.save();
    res.status(201).json({status:201});
  }catch(err)
  {
    console.log("File upload error",err);
    res.status(400).json({status:400});
  }
})



app.post("/upload",async(req,res)=>{
  try{
    const fileStr = req.body.data;
    const uploadedResponse = await cloudinary.uploader.upload(fileStr,{
      upload_preset: 'tp-images'
    })
    console.log(uploadedResponse);
    await Register.updateOne({email:req.body.user},{$set:{image:uploadedResponse.url}});
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
        await Register.updateOne({confirmationCode:code},{$set:{status:"Active"}});
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
          username:req.body.fname,
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
        res.status(201).json({status:400,error:"passwords are not same"});
      }
    }
  }catch(err){
    console.log(err);
    res.status(201).json({status:400,error:"Already a user"});
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
      // secure:true
    });
    
    if(isValid&&employee.status!=="Pending")
    {
      res.status(201).json({status:201,result:"Login Successful....",data:employee})
    }
    else if(isValid&&employee.status==="Pending")
    {
      res.status(201).json({status:400,error:"Please confirm your email first"});
    }
    else
    {
      res.json({status:400,error:"Invalid email or password",data:employee});
    }
  }catch(err)
  {
    res.json({status:400,error:"Invalid email or password",data:employee})
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
    req.data.deviceCount--;
    
    if(req.data.deviceCount==0)
    {
      //req.data.token="";
      await Register.updateOne({_id:req.data._id},{$set:{token:"",deviceCount:0}});
    }
    else
    {
      await Register.updateOne({_id:req.data._id},{$set:{deviceCount:req.data.deviceCount}});

    }

    console.log(req.data);
    //await req.data.save();
    res.status(201).json({status:201});
  } catch (error) {
    res.status(400).json({status:400,error:error});
  }
})

app.listen(port,()=>{
  console.log(`listening at port number ${port}`);
})