// import newuser from "../../../server/upload/newuser.jpg"
import {useState,useEffect} from 'react';
import React from 'react';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
toast.configure()

const UserProfile=(props)=>{
  const ref = React.useRef();
  const [previewSource,setpreviewSource] = useState()
  useEffect(()=>{
    setpreviewSource(props.data.image);
  },[]);
    const uploadImage = async (base64EncodedImage) => {
      console.log(base64EncodedImage);
      try{
        const res = await fetch('/upload',{
          method:'POST',
          body:JSON.stringify({data:base64EncodedImage,user:props.data.email}),
          headers:{'Content-type':'application/json'}
        });
        const data = res.json();
        if(data.status===400)
        {
          toast.error("Image Upload error",{position:toast.POSITION.TOP_CENTER});
        }
        else
        {
          toast.success("Image Uploaded",{position:toast.POSITION.TOP_CENTER});
        }
      }catch(err)
      {
        console.log(err);
      }
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if(!previewSource)
        {
          return;
        }
        uploadImage(previewSource);

    }
    const previewImage = (file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () =>{
        setpreviewSource(reader.result);
      }
    }
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      console.log(file);
      previewImage(file);
      ref.current.value = "";
    }
return(
  <>  
    <div className="container mx-auto">
      <p style={{fontSize: "40px"}} className="text-center text-primary pt-3">Your Profile</p>
      <hr className="w-50 mx-auto" />
      <div className="row mx-auto pb-3">
        <div className="col-md-4 col-10 pt-4  mx-auto order-md-1 order-2">
          <table>
            <thead>
              <tr><td>Name:</td><td>{props.data.fname} {props.data.lname}</td></tr>
            </thead>
            <tbody>
              <tr><td>Email:</td><td>{props.data.email}</td></tr>
              <tr><td>Gender:</td><td>{props.data.gender}</td></tr>
              <tr><td>Age:</td><td>{props.data.age}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-4 col-10 pt-4 mx-auto order-md-2 order-1">
          <img style={{width:"200px",height:"200px",borderRadius:"176px"}} src={previewSource} alt="userPic" className="img-fluid" />
          <div>
            <form method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
                <label>Upload Image</label>
                <input type="file" name="file" onChange={handleFileChange} ref={ref}/><br/><br/>
                
                <button type="submit" className="btn btn-block btn-primary">Upload</button>
            </form>
        </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default UserProfile