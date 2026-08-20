// Pulse Wave P — Pulse HR final logo
// - icon.png: 1024x1024 purple gradient bg with white P + pulse wave (L1 concept, purple theme)
// - adaptive-icon.png: transparent bg, white P+wave (foreground)
// - splash.png: solid purple with white P+wave
// - adaptive-icon-background.png: gradient
// - favicon: 48x48
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
function grad(x,y){
  const t=(x+y)/(W+H);
  const c1=[124,58,237], c2=[67,56,202];
  return [Math.round(c1[0]+(c2[0]-c1[0])*t),Math.round(c1[1]+(c2[1]-c1[1])*t),Math.round(c1[2]+(c2[2]-c1[2])*t)];
}
function fill(px,c){for(let i=0;i<px.length;i+=4){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=255;}}
function setPx(px,x,y,c,a=1){if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;if(a>=1){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=255;return;}px[i]=Math.round(px[i]*(1-a)+c[0]*a);px[i+1]=Math.round(px[i+1]*(1-a)+c[1]*a);px[i+2]=Math.round(px[i+2]*(1-a)+c[2]*a);px[i+3]=255;}
function rrect(px,x1,y1,x2,y2,r,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const dx=Math.max(x1+r-x,0,x-(x2-r));const dy=Math.max(y1+r-y,0,y-(y2-r));if(dx*dx+dy*dy<=r*r)setPx(px,x,y,c);}}
function rectFilled(px,x1,y1,x2,y2,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)setPx(px,x,y,c);}
function roundedRect(px,x1,y1,x2,y2,r,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const dx=Math.max(x1+r-x,0,x-(x2-r));const dy=Math.max(y1+r-y,0,y-(y2-r));if(dx*dx+dy*dy<=r*r)setPx(px,x,y,c);}}
function thickLine(px,x1,y1,x2,y2,w,c){
  const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1))*2;
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const x=Math.round(x1+(x2-x1)*t);
    const y=Math.round(y1+(y2-y1)*t);
    for(let dy=-w;dy<=w;dy++) for(let dx=-w;dx<=w;dx++) if(dx*dx+dy*dy<=w*w) setPx(px,x+dx,y+dy,c);
  }
}
function polyline(px,pts,w,c){ for(let i=1;i<pts.length;i++) thickLine(px,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],w,c); }

function drawPulseP(px, cx, cy, color, scale){
  const s=scale;
  const stemW = Math.round(92*s);
  const stemH = Math.round(420*s);
  const stemX1 = Math.round(cx - 90*s);
  const stemX2 = Math.round(cx - 90*s + stemW);
  const stemY1 = Math.round(cy - 190*s);
  const stemY2 = Math.round(cy - 190*s + stemH);
  rectFilled(px, stemX1, stemY1, stemX2, stemY2, color);
  const bowlX1 = Math.round(cx - 15*s);
  const bowlY1 = Math.round(cy - 190*s);
  const bowlX2 = Math.round(cx + 155*s);
  const bowlY2 = Math.round(cy + 10*s);
  const bowlR = Math.round(48*s);
  roundedRect(px, bowlX1, bowlY1, bowlX2, bowlY2, bowlR, color);
}
function eraseHole(px, cx, cy, scale, isTransparent){
  const s=scale;
  const holeX1 = Math.round(cx + 22*s);
  const holeY1 = Math.round(cy - 135*s);
  const holeX2 = Math.round(cx + 98*s);
  const holeY2 = Math.round(cy - 45*s);
  const r = Math.round(12*s);
  if(isTransparent){
    for(let y=holeY1;y<=holeY2;y++) for(let x=holeX1;x<=holeX2;x++){
      const dx=Math.max(holeX1+r - x,0, x - (holeX2 - r));
      const dy=Math.max(holeY1+r - y,0, y - (holeY2 - r));
      if(dx*dx+dy*dy <= r*r){ if(x>=0&&x<W&&y>=0&&y<H){ const i=(y*W+x)*4; px[i+3]=0; } }
    }
  } else {
    for(let y=holeY1;y<=holeY2;y++) for(let x=holeX1;x<=holeX2;x++){
      const dx=Math.max(holeX1+r - x,0, x - (holeX2 - r));
      const dy=Math.max(holeY1+r - y,0, y - (holeY2 - r));
      if(dx*dx+dy*dy <= r*r){ if(x>=0&&x<W&&y>=0&&y<H){
          const g=grad(x,y);
          const i=(y*W+x)*4;
          let c=[g[0],g[1],g[2]];
          const hx=340, hy=280;
          const d=Math.hypot(x-hx,y-hy);
          if(d<300){ const a=(1-d/300)*0.12; c[0]=Math.round(c[0]*(1-a)+255*a); c[1]=Math.round(c[1]*(1-a)+255*a); c[2]=Math.round(c[2]*(1-a)+255*a); }
          px[i]=c[0]; px[i+1]=c[1]; px[i+2]=c[2]; px[i+3]=255;
        } }
    }
  }
}
function drawWaveLine(px, cy, waveY, color, scale){
  const s=scale;
  const left = Math.round(128*s + (512-512*s));
  const right = Math.round(896*s + (512-512*s));
  // pulse centered under P stem (stem center ~ cx-44)
  const pts = [
    [ left, waveY ],
    [ Math.round(512 - 162*s), waveY ],
    [ Math.round(512 - 112*s), waveY - Math.round(38*s) ],
    [ Math.round(512 - 72*s),  waveY + Math.round(58*s) ],
    [ Math.round(512 - 44*s),  waveY - Math.round(102*s) ],
    [ Math.round(512 + 62*s),  waveY ],
    [ right, waveY ],
  ];
  const thickness = Math.round(16*s);
  polyline(px, pts, thickness, color);
}

function makeIcon(){
  const b=Buffer.alloc(W*H*4);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const c=grad(x,y); const i=(y*W+x)*4; b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255; }
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const dx=x-340,dy=y-280,d=Math.hypot(dx,dy); if(d<300){ const a=(1-d/300)*0.12; const i=(y*W+x)*4; b[i]=Math.round(b[i]*(1-a)+255*a); b[i+1]=Math.round(b[i+1]*(1-a)+255*a); b[i+2]=Math.round(b[i+2]*(1-a)+255*a); } }
  const cx=512, cy=380;
  const s=1;
  drawPulseP(b,cx,cy,[255,255,255],s);
  eraseHole(b,cx,cy,s,false);
  const stemY2 = Math.round(cy -190*s +420*s);
  const waveY = stemY2 + Math.round(102*s); // peak touches bottom
  drawWaveLine(b,cy,waveY,[255,255,255],s);
  writePNG(path.join(OUT,'icon.png'),b);
}
function makeAdaptive(){
  const b=Buffer.alloc(W*H*4);
  b.fill(0);
  const cx=512, cy=450;
  const s=0.88;
  drawPulseP(b,cx,cy,[255,255,255],s);
  eraseHole(b,cx,cy,s,true);
  const stemY2 = Math.round(cy -190*s +420*s);
  const waveY = stemY2 + Math.round(102*s);
  drawWaveLine(b,cy,waveY,[255,255,255],s);
  writePNG(path.join(OUT,'adaptive-icon.png'),b);
}
function makeSplash(){
  const b=Buffer.alloc(W*H*4);
  fill(b,[109,40,217]);
  const cx=512, cy=400;
  const s=0.72;
  drawPulseP(b,cx,cy,[255,255,255],s);
  eraseHole(b,cx,cy,s,false);
  const holeX1=Math.round(cx+22*s), holeY1=Math.round(cy-135*s), holeX2=Math.round(cx+98*s), holeY2=Math.round(cy-45*s), r=Math.round(12*s);
  for(let y=holeY1;y<=holeY2;y++) for(let x=holeX1;x<=holeX2;x++){ const dx=Math.max(holeX1+r - x,0, x-(holeX2-r)); const dy=Math.max(holeY1+r - y,0, y-(holeY2-r)); if(dx*dx+dy*dy<=r*r && x>=0&&x<W&&y>=0&&y<H){ const i=(y*W+x)*4; b[i]=109; b[i+1]=40; b[i+2]=217; b[i+3]=255; } }
  const stemY2 = Math.round(cy -190*s +420*s);
  const waveY = stemY2 + Math.round(102*s);
  drawWaveLine(b,cy,waveY,[255,255,255],s);
  writePNG(path.join(OUT,'splash.png'),b);
}
function makeAdaptiveBg(){
  const b=Buffer.alloc(W*H*4);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const c=grad(x,y); const i=(y*W+x)*4; b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255; }
  writePNG(path.join(OUT,'adaptive-icon-background.png'),b);
}
function makeFavicon(){
  const S=48;
  const b=Buffer.alloc(S*S*4);
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const t=(x+y)/(S+S); const c=[Math.round(124+(67-124)*t),Math.round(58+(56-58)*t),Math.round(237+(202-237)*t)]; const i=(y*S+x)*4; b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255; }
  writePNG(path.join(OUT,'favicon.png'),b,S,S);
}
makeIcon();
makeAdaptive();
makeAdaptiveBg();
makeSplash();
makeFavicon();
console.log('Pulse HR "Pulse Wave P" logo assets generated');
