//////////////////LOAD IMAGES/////////////////////    
const bg = new Image();
bg.src = "img/sky-background.png";
const spaceShip = new Image();
spaceShip.src = 'img/spaceshipT.png';
const enemyShip = new Image();
enemyShip.src = 'img/enemy2.png';
const missilePic = new Image();
missilePic.src = 'img/missile.png';
const explosionImg = new Image();
explosionImg.src = 'img/explosion-sprite.png';
const bot = new Image();
bot.src = 'img/bot25.png';
const heart = new Image();
heart.src = 'img/life.png';
const light = new Image();
light.src = 'img/nuke.png';

/////////////////MAIN FUNCTION/////////////////////////            

function init(){
   const c = document.getElementById('my_canvas');
   const ctx = c.getContext('2d');
   const cW = c.width;
   const cH = c.height;

   let enemies = [];
   let sinEnemies = [];
   let missiles = [];
   let explosions = [];

   let life = 5;
   let score = 0;
   let fireInt;
   let fireON = false;
   let nuke = false;
   let inGame = true;

   let tick = 0;
   let expTick = 0;
   let faster = 0;

///////////////////////////GAME OBJECTS/////////////////////
//GAME ELEMENT SUPER CLASS
   class GameElement{

       constructor(x,y,w,h,img){
           this.x = x;
           this.y = y;
           this.w = w;
           this.h = h;
           this.img = img;
       }

       render(){
           ctx.drawImage(this.img,this.x,this.y);
       }

   }
//BACKGROUND              
   class Background extends GameElement{

       constructor(x,y,w,h,img){
           super(x,y,w,h,img);
       }

       update(){
           this.y++;
           this.y>= 0?this.y = -1000:this.y=this.y;
       }

   }
//SPHIP SUPER CLASS               
   class Ship extends GameElement{
       constructor(x,y,w,h,img){
           super(x,y,w,h,img);
       }

       fly(){
           this.update();
           this.render();
       }
   }

   class PlayersShip extends Ship{

       constructor(x,y,w,h,img){
           super(x,y,w,h,img);
           this.easeDown = 1;
       }

       fire(){
           const missile = new PlayersShipMissile(this.x + this.w/2-6.2,this.y-20,11,21);
           missiles.push(missile);
           missile.render();
       }
   }
//PLAYERS SHIP               
   class PlayersShipMissile extends Ship{

       constructor(x,y){
           super(x,y);
           this.img = missilePic;
           this.w = missilePic.width;
           this.h = missilePic.height;
       }

       update(){
           this.y -=4;
       }

       collisionDetect(){

           for(let i =0;i<enemies.length;i++){

               if(this.y<=enemies[i].y+enemies[i].h&&
                   this.y>enemies[i].y&&
                   this.x>=enemies[i].x&&
                   this.x<=enemies[i].x+enemies[i].w){

                   enemies[i].explode(); 
                   enemies[i].erase();

                   enemies.splice(i,1);

                   return true;
                }

            }
        }
   }
//REGULAR ENEMY             
   class EnemysShip extends Ship{

       constructor(){
           super();
           this.img = enemyShip;
           this.w = this.img.width;
           this.h = this.img.height;
           this.y = -this.h;
           this.x = Math.floor(Math.random()*(cW-this.w))+1;
           this.speedY = Math.floor(Math.random()*5)+1.5;
           this.explosionMarginX = 7;
           this.explosionMarginY = 7;
           this.pointsWorth = 2;
       }

       update(){
           this.y +=this.speedY;
       }

       explode(){
           const explosion = new Explosion(this.x-this.explosionMarginX,this.y-this.explosionMarginY,65,55,explosionImg);
           explosions.push(explosion);
           score += this.pointsWorth;
       }

       erase(){

           this.x = -50;
           this.y = -50;

       }

   }
//SINUSOIDAL ENEMY              
   class EnemysShipSinusoidal extends EnemysShip{

       constructor(){
           super();
           this.img = bot;
           this.x = 100;
           this.y = -25;
           this.w = 30;
           this.h = 30;
           this.r = 10;
           this.numOfTicks = 0;
           this.speedY = 3 + faster;
           this.explosionMarginX = 10;
           this.explosionMarginY = 8;
           this.pointsWorth = 1;
       }

       render(){
           ctx.drawImage(this.img,0,0,this.w,this.h,this.x,this.y,this.w,this.h);
       }

       update(){
           this.numOfTicks++;

           this.x = (50 * Math.sin(this.numOfTicks * 0.5 * Math.PI/15)) + 150;
           this.y += this.speedY;

       }

       erase(){

           this.x = -50;
           this.y = -50;

       }

   }
//EXPLOSIONS              
   class Explosion extends GameElement{

       constructor(x,y,w,h,img){
           super(x,y,w,h,img);
           this.srcX = 0,
           this.srcY = 0,
           this.currentFrame = 0;
       }

       render(){
           ctx.drawImage(this.img,this.srcX,this.srcY,this.w,this.h,this.x,this.y,this.w,this.h);
       }

       update(){

           this.currentFrame++;
           this.srcX = this.currentFrame * this.w;

       }

   }

//LIFE               
   class Life{

       constructor(){
           this.x = 345,
           this.y = 30,
           this.w = 35;
           this.h = 30;
           this.img = heart;
       }


       render(){
           let xN = this.x;

           for(let i=0;i<life;i++){

                ctx.drawImage(heart,xN,this.y);
                xN -= 32;
           }
       }
   }

///////////////////////CLASS MANAGER FUNCTIONS CALLED INSIDE THE GAME LOOP///////////////////////////////////////

//NUKE EXTINTION               
   function nukeExtintion(){
       for(var i = 0;i<enemies.length;i++){

               const exN = new Explosion(enemies[i].x-17,enemies[i].y-7,79,79,light);
                explosions.push(exN);
        }

       enemies = [];
       sinEnemies = [];
       nuke = false;
       life--;
   }
//PLAYERS SHIP MOVE FUNCTION 
   let speed = 0;
   function movePlayersShip(){          
        speed *= playersShip.easeDown;
        speed = parseFloat(speed.toFixed(3));
        playersShip.x += speed;
        playersShip.render();

        playersShip.x<0?playersShip.x=0:playersShip.x=playersShip.x;
        playersShip.x>cW-playersShip.w?playersShip.x=cW-playersShip.w:playersShip.x=playersShip.x;
   }
//ENEMYS MANAGER               
   function moveEnemys(){
       for(var i = 0;i<enemies.length;i++){

          if(enemies[i].y>cH){
              enemies.splice(i,1);
              life-=1;

              i--;
          }else{
              enemies[i].fly();
          }

        }
   }

//SINUSOIDAL ENEMIES RELEASE               
   let ticks = 0;
   let comming = false;
   let interval = 400;
   function sendSinEnemies(){

        if(ticks === 30){
            comming ===false?comming=true:comming= false;
            ticks = 0;
            return
        }
        if(comming&&ticks<25){
            const sinEnemy = new EnemysShipSinusoidal();
            enemies.push(sinEnemy);
            sinEnemies.push(sinEnemy);
        }
        ticks++;
        interval -= 30;
    }
    setInterval(sendSinEnemies,interval);    

//MISSILES MANAGER               
   function moveMissiles(){
       for(var x=0;x<missiles.length;x++){ 
           if(missiles[x].collisionDetect()||missiles[x].y<=-missiles[x].h){

               missiles.splice(x,1);
                x===0?x=x:x--;

               break;
           }
            if(missiles[x].y>-missiles[x].h&&!missiles[x].collisionDetect()){

               missiles[x].fly();

           }

       }
   }
//EXPLOSION MANAGER               
   function explosionManager(){
       for(var j=0;j<explosions.length;j++){
           if(explosions[j].currentFrame>8){
               explosions.splice(j,1);
               j--;
           }else{

               if(expTick === 2){

               explosions[j].update();

               }
               explosions[j].render();
           }
       }

       expTick ===2?expTick = 0:expTick=expTick;
       expTick++;
   }
//SCORE SHOWER              
   function scoreManager(){
       ctx.fillStyle = "rgb(0, 230, 0)";
       ctx.font = '40px Luckiest Guy'/*Permanent Marker*/;
       ctx.fillText(score, 30, 62);
       ctx.strokeStyle = "white";
       ctx.strokeText(score, 30, 62);

       lifeScore.render();
   }
//MENU SHOWER              
   function menu(){
       if(!inGame){ 
           fireON = false;
           clearInterval(fireInt,300);
           missiles = [];
           visible(document.querySelector('.results'));

           ctx.fillStyle = "rgba(0, 0, 0,0.7)";
           ctx.fillRect(0,0,cW,cH);
           document.querySelector(".score").innerHTML = score;
        }else{
            visibilityHide(document.querySelector('.results'));
        }

        life <=0?inGame = false: inGame = true;
   }

//////////////////////////////////////////////////GAME-LOOP/////////////////////////////////////            
   function animate(){
       ctx.clearRect(0,0,cW,cH);

       tick++;
       tick += faster;
       faster += 0.001;

       background.update();
       background.render();

       if(tick >=70){/*30*/
          const enemy = new EnemysShip();
          enemy.render();
          enemies.push(enemy);
          tick = 0;
       }

       movePlayersShip();

       if(nuke){nukeExtintion()}

       moveEnemys();
       moveMissiles();
       explosionManager();
       scoreManager();
       menu(); 

   }
   setInterval(animate,40);          

//////////////////////////EVENT-LISTENERS FUNCTIONS///////////////////////////////   

//NUKE EXTINTION              
   document.addEventListener('keydown', NUKE);
   function NUKE(event){
       if(event.keyCode === 67&&inGame){
           nuke = true;
       }
   }

//MOVE PLAYERS SHIP              
   document.addEventListener('keydown',move);
   function move(event){
      if(event.keyCode === 37&& playersShip.x > 0){ 

          playersShip.easeDown = 1;
          speed = -8;
          sphi1Move = true;

      }
      if(event.keyCode === 39&& playersShip.x < cW - playersShip.w){ 

          playersShip.easeDown = 1;
          speed = 8;
          sphi1Move = true;

      }

   }
//STOP PLAYERS SHIP               
   document.addEventListener('keyup',stop);
   function stop(event){
      if(event.keyCode === 37 || event.keyCode === 39){ 
          playersShip.easeDown = 0.9;

      }
   }

   document.addEventListener('keydown',singleFire);
   function singleFire(event){
       if(event.keyCode === 32&&inGame){

                playersShip.fire();
       }
   }
//AUTOFIRE               
   document.addEventListener('keydown',autoFire);
   function autoFire(event){
       if(event.keyCode === 16&&fireON===false&&inGame){

           fireON=true;
           clearInterval(fireInt,300);
           fireInt = setInterval(function(){
                playersShip.fire();
            },300);

           return;

       }
       if(event.keyCode === 16&&fireON===true&&inGame){
           fireON=false;
           clearInterval(fireInt,300);

       }
   }
//////////////////////FOR THE PLAY AGAIN BUTTON///////////////////                     
    function toggleFontSize(id,smallFont,bigFont,letterSpacing){

        const x = document.querySelector(id).style;
        if(x.fontSize===smallFont+'px'){
            x.fontSize=bigFont+'px';
            x.letterSpacing=letterSpacing+'px';
        }else{
            x.fontSize=smallFont+'px';
            x.letterSpacing="0px";
        }
    }

    setInterval(function(){ toggleFontSize(".play-again",'30','33.5','1.5');},400);

    document.querySelector('.game-wrap').addEventListener('click',function(event){

        if(event.target.classList.contains('new')){
            newGame();
        }
    });
///////////////////HIDE/SHOW MENU///////////////////////////              
   function visibilityHide(id){

        id.style.visibility = "hidden";
        id.style.opacity = "0";
    }

   function visible(id){
        id.style.visibility = "visible";
        id.style.opacity = "1";
    }

///////////////////INITIALIZING NEW GAME////////////////////           

   function newGame(){

       let fireON = false;

       playersShip.y = 380;
       playersShip.x = cW/2 - playersShip.w/2;
       playersShip.render();

       enemies = [];
       sinEnemies = [];
       missiles = [];
       explosions = [];
       faster = 0;
       inGame = true;
       life = 5;
       score = 0;
   }
///////////////////BUIDING GAMES MAIN OBJ///////////////////////////////               
   const lifeScore = new Life();
   const background = new Background(0,-1000,bg.width,bg.height,bg);
   const playersShip = new PlayersShip(cW/2 - 47/2,380,47,47,spaceShip);
   playersShip.render();
}

//////////////////////////////CALL INIT////////////////////////////////////////
window.onload = init;

////////////////////PREVENT FROM SCROLLING WHEN KEYDOWN//////////////////////
window.addEventListener("keydown", function(e) {
// space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);