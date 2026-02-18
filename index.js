const express = require('express');
const dotenv = require('dotenv');
const socket=require('socket.io')
const http=require('http')
const{Chess}=require('chess.js');
const path = require('path');
const userRouter=require('./routes/user.route')

dotenv.config();

const app = express();

const server=http.createServer(app)
const io=socket(server)

const chess=new Chess();
let players={}
let currentPlayer="W"

// index.js
app.set("views", path.join(__dirname, "views")); // Use absolute path
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(userRouter)

io.on("connection",(uniquesocket)=>{
    console.log("connected")
    
    if(!players.white){
        players.white=uniquesocket.id
        uniquesocket.emit("PlayerRole","w")
    }
    else if(!players.black){
        players.black=uniquesocket.id
        uniquesocket.emit("PlayerRole","b")
    }
    else{
        uniquesocket.emit("SpectatorRole")
    }
    uniquesocket.on("disconnect",()=>{
        if(uniquesocket.id=== players.white||uniquesocket.id=== players.black){
            delete players.white;
            delete players.black;
        }
    })

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn==="w" && uniquesocket.id!=players.white) return
            if(chess.turn==="b" && uniquesocket.id!=players.black) return //this disables the invalid player move

            const result=chess.move(move)
            if(result){
                currentPlayer=chess.turn()
                io.emit("move",move)
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("Invalid Move: ",move);
                uniquesocket.emit("invalidMove",move)
            }
        }catch(err){
                console.log(err);
                uniquesocket.emit("Invalid Move : ",move)
        }
    })
    
})

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
// Add this at the bottom of index.js (formerly app.js)
module.exports = app;
