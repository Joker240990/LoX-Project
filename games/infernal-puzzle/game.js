// Very simple match-3 prototype demo: click tiles to swap; win gives coins
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const cols = 8, rows = 10;
const tileSize = 48;
let grid = [];
const types = ["#b22","#b66","#ff6","#6b2","#26b"];

function randType(){ return Math.floor(Math.random()*types.length); }
for (let y=0;y<rows;y++){ grid[y]=[]; for (let x=0;x<cols;x++) grid[y][x]={t:randType()}; }
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let y=0;y<rows;y++){
    for (let x=0;x<cols;x++){
      ctx.fillStyle = types[grid[y][x].t]; ctx.fillRect(x*tileSize,y*tileSize,tileSize-2,tileSize-2);
    }
  }
}
canvas.addEventListener('click', e=>{
  const x = Math.floor(e.offsetX / tileSize), y = Math.floor(e.offsetY / tileSize);
  // simple remove
  grid[y][x].t = randType();
  draw();
});
draw();
