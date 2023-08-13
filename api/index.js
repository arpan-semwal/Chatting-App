const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require('jsonwebtoken');
const cors = require('cors');
dotenv.config();
mongoose.connect(process.env.MONGO_URL );
const jwtSecret = process.env. JWT_SECRET;



const app = express();
app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL,
}))

app.use(express.json());


app.get('/test' , (req , res) => {
    res.json("It works ok");
    console.log("Server starts at port 4000");
});

app.post('/register' , async(req ,res) => {
   
    const {username , password} = req.body;
    try{
        const createdUser = await User.create({username , password}); // Uses the User model to create a new user record in the database. The create method returns a Promise that resolves to the newly created user object.

        jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err , token) => {
            // Generates a JSON Web Token (JWT) using the jwt.sign method from the jsonwebtoken library. The token is signed with the user's _id (usually representing the user's unique identifier in the database) and a secret key (jwtSecret). The callback function receives an error (err) and the generated token (token).
            if(err) throw err;
            res.cookie('token' , token).status(201).json({
                id:createdUser._id,
            });
        });
    }
    catch(err){
        if(err) throw err;
        res.status(500).json('err')
    }
});


app.listen(4000, () => {
    console.log("Server starts at port 4000");
});