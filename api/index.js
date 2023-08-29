const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const User = require("./models/User");
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const cors = require('cors');
dotenv.config();
mongoose.connect(process.env.MONGO_URL );
const jwtSecret = process.env. JWT_SECRET;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');
const UserModel = require("./models/User");

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

function getUserDataFromRequest(req){
    return new Promise((resolve , reject) => {
        const token = req.cookies?.token;
    if (token){
        jwt.verify(token , jwtSecret , {} , (err , userData) => {
            if (err) throw err;
            const {id , username} = userData;
            resolve(userData);
        });
    } else{
        reject('no token');
    }
    })
    
}


app.get("/people" , async(req , res) => {
    const users = await User.find({} , {'_id':1 , username:1});
    res.json(users);
})


app.get('/messages/:userId' , async(req,res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    
    const messages = await Message.find({
       sender: {$in:[userId ,ourUserId]},
       recipient:{$in:[userId , ourUserId]},
    }).sort({createdAt:1});

    res.json(messages);

})





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
    const foundUser = await User.findOne({username});

    if(foundUser){
        const passOk = bcrypt.compareSync(password , foundUser.password);
        if(passOk){
            jwt.sign({ userId: foundUser._id , username } , jwtSecret , {} , (err , token) => {
                res.cookie('token' , token).json({
                    id:foundUser._id,
                });
            });
        }
    }

}) 


const server = app.listen(4000, () => {//web socket server
    console.log("Server starts at port 4000");
});


const wss = new ws.WebSocketServer({server});
//we are taking the cookie from the headers adn we are spliting it if we are having more than one cookie and we are stroing that cookei tahth starts with token=

wss.on('connection' , (connection , req) => {

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            console.log('dead');
        } , 1000)
    } , 5000);

    connection.on('pong' , () => {
        clearTimeout(connection.deathTimer);
    })




    const cookies = req.headers.cookie;
    if(cookies){
     const tokenCookieString = cookies.split(";").find(str => str.startsWith('token='));
     if(tokenCookieString){
        const token = tokenCookieString.split("=")[1];
        if(token){
            jwt.verify(token , jwtSecret , {} , (err , userData) => {
                if(err) throw err;
                const {userId , username} = userData;
                connection.userId = userId
                connection.username = username;
            })
        }
     }
    }

    //notify everyone about online people 
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
        online:[...wss.clients].map(c =>({userId:c.userId , username:c.username}))
    }))
    });


    connection.on('message' , async(message) => {
       const messageData = JSON.parse(message.toString());
       const {recipient , text} = messageData;
       if(recipient && text){
        const messageDoc = await Message.create({
            sender:connection.userId,
            recipient,
            text,
        });
        [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
            text , 
            sender:connection.userId,
            recipient,
            _id:messageDoc._id,
        
        })));
       }
    })

   
        
});

wss.on('close' , () => {
    console.log('disconnect' , data);
})