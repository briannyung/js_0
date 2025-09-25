const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const mouse = {x:0,y:0};
canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('click', ()=>{
    if(!accepted){
        if(isMouseOverButton(yesBtn)) accept();
        if(isMouseOverButton(noBtn)) moveNo();
    }
});

function isMouseOverButton(btn){
    return mouse.x >= btn.x && mouse.x <= btn.x + btn.w &&
           mouse.y >= btn.y && mouse.y <= btn.y + btn.h;
}

let yesBtn = {x:0,y:0,w:0,h:0,scale:1,dir:1,text:"Yes"};
let noBtn = {x:0,y:0,w:0,h:0,scale:1,dir:1,text:"No"};
let accepted = false;
let hearts = [];
let bouquetOffset=0, bouquetTime=0;
let sparkles = [];

const heartImg = new Image();
heartImg.src='heart.png';
const bouquetImg = new Image();
bouquetImg.src='bouquet.png';

// Initialize sparkles
for(let i=0;i<80;i++){
    sparkles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        radius: 1+Math.random()*2,
        speed: 0.2 + Math.random()*0.5,
        alpha: 0.5 + Math.random()*0.5,
        alphaDir: Math.random()>0.5?0.01:-0.01
    });
}

function updatePositions(){
    yesBtn.w = canvas.width*0.18;
    yesBtn.h = canvas.height*0.12;
    yesBtn.x = canvas.width*0.25 - yesBtn.w/2;
    yesBtn.y = canvas.height*0.65;

    noBtn.w = canvas.width*0.18;
    noBtn.h = canvas.height*0.12;
    noBtn.x = canvas.width*0.75 - noBtn.w/2;
    noBtn.y = canvas.height*0.65;
}

function accept(){
    accepted=true;
    for(let i=0;i<30;i++){
        hearts.push({
            x: Math.random()*canvas.width,
            y: canvas.height + Math.random()*canvas.height*0.3,
            speed: 1 + Math.random()*2,
            scale: 0.03 + Math.random()*0.05,
            rot: Math.random()*360,
            rotSpeed: (Math.random()>0.5?1:-1)*(0.3+Math.random()*0.5)
        });
    }
}

function moveNo(){
    noBtn.x = Math.random()*(canvas.width-noBtn.w);
    noBtn.y = Math.random()*(canvas.height-noBtn.h);
}

function drawButton(btn){
    ctx.save();
    const w = btn.w*btn.scale, h=btn.h*btn.scale;
    const x = btn.x-(w-btn.w)/2, y = btn.y-(h-btn.h)/2;
    ctx.fillStyle = isMouseOverButton(btn)?(btn.text=="Yes"?"pink":"orange"):btn.text=="Yes"?"violet":"maroon";
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle="white";
    ctx.font = `${Math.floor(canvas.height*0.05)}px monospace`;
    ctx.fillText(btn.text,x+w*0.15,y+h*0.65);
    ctx.restore();
}

function drawHeart(h){
    ctx.save();
    ctx.translate(h.x,h.y);
    ctx.rotate(h.rot*Math.PI/180);
    ctx.drawImage(heartImg,-heartImg.width*h.scale/2,-heartImg.height*h.scale/2,heartImg.width*h.scale,heartImg.height*h.scale);
    ctx.restore();
}

function drawSparkle(s){
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
}

function loop(){
    updatePositions();
    bouquetTime+=0.03;
    bouquetOffset = Math.sin(bouquetTime)*canvas.height*0.015;

    // Background gradient
    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,"rgb(255,160,120)");
    grad.addColorStop(1,"rgb(100,40,200)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw sparkles
    for(let s of sparkles){
        s.y -= s.speed;
        s.alpha += s.alphaDir;
        if(s.alpha>1){ s.alpha=1; s.alphaDir*=-1; }
        if(s.alpha<0.2){ s.alpha=0.2; s.alphaDir*=-1; }
        if(s.y<0) s.y = canvas.height;
        drawSparkle(s);
    }

    // Bouquet bottom-right
    const bouquetScale = 0.7;
    const bouquetW = bouquetImg.width*bouquetScale;
    const bouquetH = bouquetImg.height*bouquetScale;
    ctx.drawImage(bouquetImg,canvas.width-bouquetW-10,canvas.height-bouquetH-10+bouquetOffset,bouquetW,bouquetH);

    if(!accepted){
        // Question text slightly above center
        ctx.fillStyle="orange";
        ctx.font=`${Math.floor(canvas.height*0.065)}px monospace`;
        const question = "Will you go to HoCo with me?";
        const textW = ctx.measureText(question).width;
        ctx.fillText(question,(canvas.width-textW)/2,canvas.height*0.45);

        // Yes button bounce
        yesBtn.scale += isMouseOverButton(yesBtn)?0.02*yesBtn.dir:0;
        if(yesBtn.scale>1.15||yesBtn.scale<1) yesBtn.dir*=-1;
        yesBtn.scale = Math.max(1,Math.min(yesBtn.scale,1.15));
        drawButton(yesBtn);

        // No button runs away
        if(isMouseOverButton(noBtn)) moveNo();
        drawButton(noBtn);
    }else{
        // Translucent big heart
        ctx.globalAlpha = 0.3;
        ctx.drawImage(heartImg,canvas.width/2-heartImg.width*0.75,canvas.height/2-heartImg.height*0.75,heartImg.width*1.5,heartImg.height*1.5);
        ctx.globalAlpha = 1.0;

        // YAY text dead center
        ctx.fillStyle="white";
        ctx.font=`${Math.floor(canvas.height*0.12)}px monospace`;
        const yayText = "Yay!! :)";
        const textW = ctx.measureText(yayText).width;
        ctx.fillText(yayText,(canvas.width-textW)/2,canvas.height/2);

        // Floating hearts
        hearts.forEach(h=>{
            h.y-=h.speed;
            h.x+=Math.sin(Date.now()/500+h.y*0.05)*0.3*canvas.width/800;
            h.rot+=h.rotSpeed;
            drawHeart(h);
        });
    }

    requestAnimationFrame(loop);
}

heartImg.onload = ()=>{ bouquetImg.onload = ()=>{ loop(); } }
