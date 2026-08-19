// Final logo — Pulse HR "Pulse Wave"
// - icon.png:        1024x1024 purple gradient bg with white waveform bars
// - adaptive-icon:   1024x1024 transparent bg, white waveform centered (with ~25% padding)
// - splash.png:      1024x1024 solid purple background
// - favicon:         48x48 (generated from icon)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 1024, H = 1024;
const OUT = path.join(__dirname);

function crc32(buf){let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let c=0xffffffff;for(const b of buf)c=(t[(c^b)&0xff]^(c>>>8))>>>0;return (c^0xffffffff)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const T=Buffer.from(t,'ascii');const C=Buffer.alloc(4);C.writeUInt32BE(crc32(Buffer.concat([T,d])),0);return Buffer.concat([l,T,d,C]);}
function writePNG(f,px,w=W,h=H){
  const raw=Buffer.alloc(h*(1+w*4));let p=0;
  for(let y=0;y<h;y++){raw[p++]=0;for(let x=0;x<w;x++){const i=(y*w+x)*4;raw[p++]=px[i];raw[p++]=px[i+1];raw[p++]=px[i+2];raw[p++]=px[i+3];}}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
  fs.writeFileSync(f,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}

// purple gradient (top-left #7C3AED -> bottom-right #4338CA)
function grad(x,y){
  const t=(x+y)/(W+H);
  const c1=[124,58,237], c2=[67,56,202];
  return [Math.round(c1[0]+(c2[0]-c1[0])*t),Math.round(c1[1]+(c2[1]-c1[1])*t),Math.round(c1[2]+(c2[2]-c1[2])*t)];
}
function fill(px,c){for(let i=0;i<px.length;i+=4){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=255;}}
function setPx(px,x,y,c,a=1){if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;if(a>=1){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=255;return;}px[i]=Math.round(px[i]*(1-a)+c[0]*a);px[i+1]=Math.round(px[i+1]*(1-a)+c[1]*a);px[i+2]=Math.round(px[i+2]*(1-a)+c[2]*a);px[i+3]=255;}
function rrect(px,x1,y1,x2,y2,r,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const dx=Math.max(x1+r-x,0,x-(x2-r));const dy=Math.max(y1+r-y,0,y-(y2-r));if(dx*dx+dy*dy<=r*r)setPx(px,x,y,c);}}

function roundRectPath(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

function drawWave(px,cx,cy,barColor,scale=1,glow=false){
  // 7 vertical bars with varying heights (pulse waveform)
  const bars=[
    {w:52,h:120},{w:58,h:200},{w:64,h:300},{w:72,h:420},
    {w:64,h:280},{w:58,h:180},{w:52,h:100},
  ];
  const gap=28;
  const total=bars.reduce((s,b)=>s+b.w,0)+gap*(bars.length-1);
  let x=cx-total/2;
  const baseY=cy+220*scale;
  if(glow){
    for(let pass=0;pass<3;pass++){
      let xg=cx-total/2;
      const glowColor=[barColor[0],barColor[1],barColor[2],0.15/(pass+1)];
      for(const b of bars){
        rrect(px,Math.round(xg)-pass*8, Math.round(baseY-b.h*scale)-pass*8,
              Math.round(xg+b.w*scale)+pass*8, Math.round(baseY)+pass*8,
              Math.round(b.w*scale/2), glowColor);
        xg+=b.w*scale+gap*scale;
      }
    }
  }
  for(const b of bars){
    rrect(px,
      Math.round(x), Math.round(baseY-b.h*scale),
      Math.round(x+b.w*scale), Math.round(baseY),
      Math.round(b.w*scale/2), barColor);
    x+=b.w*scale+gap*scale;
  }
}

// icon.png: purple gradient bg, white pulse wave with subtle highlight
function icon(){
  const b=Buffer.alloc(W*H*4);
  // gradient bg
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const c=grad(x,y);
    const i=(y*W+x)*4;
    b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255;
  }
  // subtle radial highlight
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const dx=x-340,dy=y-280,d=Math.hypot(dx,dy);
    if(d<300){
      const a=(1-d/300)*0.12;
      const i=(y*W+x)*4;
      b[i]=Math.round(b[i]*(1-a)+255*a);
      b[i+1]=Math.round(b[i+1]*(1-a)+255*a);
      b[i+2]=Math.round(b[i+2]*(1-a)+255*a);
    }
  }
  drawWave(b,512,420,[255,255,255],1,true);
  writePNG(path.join(OUT,'icon.png'),b);
}

// adaptive-icon.png: transparent bg, white wave (foreground); Android adds gradient via adaptive background XML
function adaptiveIcon(){
  const b=Buffer.alloc(W*H*4);
  // transparent bg
  b.fill(0);
  // white wave slightly smaller (safe zone)
  drawWave(b,512,460,[255,255,255],0.85,false);
  writePNG(path.join(OUT,'adaptive-icon.png'),b);
}

// splash.png: solid purple
function splash(){
  const b=Buffer.alloc(W*H*4);
  fill(b,[109,40,217]);
  drawWave(b,512,460,[255,255,255],0.7,false);
  writePNG(path.join(OUT,'splash.png'),b);
}

// Android adaptive background (separate full-bleed gradient)
function adaptiveBg(){
  const b=Buffer.alloc(W*H*4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const c=grad(x,y);
    const i=(y*W+x)*4;
    b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255;
  }
  writePNG(path.join(OUT,'adaptive-icon-background.png'),b);
}

// Favicon (small)
function favicon(){
  const S=48;
  const b=Buffer.alloc(S*S*4);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const t=(x+y)/(S+S);
    const c=[Math.round(124+(67-124)*t),Math.round(58+(56-58)*t),Math.round(237+(202-237)*t)];
    const i=(y*S+x)*4;b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255;
  }
  writePNG(path.join(OUT,'favicon.png'),b,S,S);
}

icon();
adaptiveIcon();
adaptiveBg();
splash();
favicon();
console.log('Pulse HR "Pulse Wave" logo assets generated');
