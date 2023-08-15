const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require('jsonwebtoken');
const cors = require('cors');
dotenv.config();
mongoose.connect(process.env.MONGO_URL );
const jwtSecret = process.env. JWT_SECRET;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL,
}));

const bcryptSalt = bcrypt.genSaltSync(10);

app.use(express.json());
app.use(cookieParser());

app.get('/test' , (req , res) => { // to check wether the server is working
    res.json("It works ok");
    console.log("Server starts at port 4000");
});

app.get('/profile' , (req , res) => {
    const token = req.cookies?.token;
    if (token){
        jwt.verify(token , jwtSecret , {} , (err , userData) => {
            if (err) throw err;
            const {id , username} = userData;
            res.json(userData);
        });
        
    }else{
        res.status(401).json("no token");
    }
   
})

app.post('/register' , async(req ,res) => { // for register
   
    const {username , password} = req.body;
    try{
        const hashedPassword = bcrypt.hashSync(password , bcryptSalt)
        const createdUser = await User.create({
            username:username , 
            password:hashedPassword
        
        }); // Uses the User model to create a new user record in the database. The create method returns a Promise that resolves to the newly created user object.

        jwt.sign({ userId: createdUser._id , username }, jwtSecret, {}, (err , token) => {
            // Generates a JSON Web Token (JWT) using the jwt.sign method from the jsonwebtoken library. The token is signed with the user's _id (usually representing the user's unique identifier in the database) and a secret key (jwtSecret). The callback function receives an error (err) and the generated token (token).
            if(err) throw err;
            res.cookie('token' , token , {sameSite:"none" , secure:true}).status(201).json({
                id:createdUser._id,
            });
        });
    }
    catch(err){
        if(err) throw err;
        res.status(500).json('err')
    }
});


app.post("/login" , async(req, res) => {
    const {username , password} = req.body;
    const foundUser = await User.find({username});

}) 


app.listen(4000, () => {
    console.log("Server starts at port 4000");
});