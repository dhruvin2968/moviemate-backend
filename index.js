const express = require("express") 
const mongoose = require('mongoose') 
const cors = require("cors") 
const UserModel=require('./models/User')
const app = express() 
app.use(express.json()) 
app.use(cors()) 
const PORT = process.env.PORT || 3001;  // Use Render's assigned port or fallback to 3001 locally


require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
app.post('/register', (req, res) => { 
    UserModel.create(req.body)
    .then(users=>res.json(users))
    .catch (err=>res.json(err))
}) 
app.post('/login', (req, res) => { 
    const {email,password} =req.body;
    UserModel.findOne({email:email})
    .then(user=>{
        if(user){
            if(user.password===password)
            {
                res.json("Success")
            }
            else
            {
                res.json("Incorrect Password")
            }
        }
        else
        {
            res.json("Email doesn't exist")
        }
    })
}) 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });