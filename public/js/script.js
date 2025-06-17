
const socket = io() //connect frontend socket
const chess = new Chess();//chess engine run

const boardElement=document.querySelector(".chessboard")
let draggedPiece=null
let sourceSquare=null
let PlayerRole=null

const renderBoard=()=>{
    const board=chess.board()
    boardElement.innerHTML=""
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement=document.createElement("div")  //creating the squares with light and dark themes as in chess board 
            squareElement.classList.add("square",              //  |
                ((rowindex+squareindex)%2)? "dark":"light" // <-----
            )
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;

            if(square){
                const pieceElement=document.createElement("div")
                pieceElement.classList.add("piece",(square.color==="w")? "white": "black")
                pieceElement.innerText=getPieceUnicode(square)                         
                pieceElement.draggable= PlayerRole===square.color; //jo bhi square par piecehoga we will overlap that div with the role color

                //lets play with drag and drop events 

                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement
                        sourceSquare={row:rowindex,col:squareindex}
                        e.dataTransfer.setData('text/plain',"")//so there is no problem in dragging
                    }
                })
                pieceElement.addEventListener("dragend",()=>{
                    draggedPiece=null
                    sourceSquare=null
                })
                squareElement.appendChild(pieceElement)
            }
            squareElement.addEventListener("dragover",(e)=>{ //handling dragover event
                e.preventDefault()
            })
            squareElement.addEventListener("drop",(e)=>{
                e.preventDefault()
                const targetSource={
                    row:parseInt(squareElement.dataset.row),
                    col:parseInt(squareElement.dataset.col)
                }
                handleMove(sourceSquare,targetSource) // kaha se kaha jana hai
            })
            boardElement.appendChild(squareElement);
        })
    })
    if(PlayerRole==="b"){
        boardElement.classList.add("flipped")
    }else{
        boardElement.classList.remove("flipped")
    }
}

const handleMove=(source,target)=>{
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit("move",move)
}

const getPieceUnicode=(piece)=>{
    const unicodePieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔"
};
    return unicodePieces[piece.type]||"";
}
socket.on("PlayerRole", (role) => {
    PlayerRole = role;
    renderBoard();
});
socket.on("spectatorRole", () => {
    PlayerRole = null;
    renderBoard();
});
socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});
socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});
renderBoard();