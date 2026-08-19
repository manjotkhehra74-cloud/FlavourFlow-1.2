// Generate 5 UI direction mockups as phone screens (540x1080 each)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 540, H = 1080, R = 36;
const out = path.join(__dirname);

function crc32(buf){let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}let c=0xffffffff;for(const b of buf)c=(t[(c^b)&0xff]^(c>>>8))>>>0;return (c^0xffffffff)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const T=Buffer.from(t,'ascii');const C=Buffer.alloc(4);C.writeUInt32BE(crc32(Buffer.concat([T,d])),0);return Buffer.concat([l,T,d,C]);}
function writePng(f,px){const raw=Buffer.alloc(H*(1+W*4));let p=0;for(let y=0;y<H;y++){raw[p++]=0;for(let x=0;x<W;x++){const i=(y*W+x)*4;raw[p++]=px[i];raw[p++]=px[i+1];raw[p++]=px[i+2];raw[p++]=px[i+3];}}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;fs.writeFileSync(f,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));}

function newBuf(bg){const b=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){b[i*4]=bg[0];b[i*4+1]=bg[1];b[i*4+2]=bg[2];b[i*4+3]=255;}return b;}
function px(b,x,y,c,a=1){if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;if(a>=1){b[i]=c[0];b[i+1]=c[1];b[i+2]=c[2];b[i+3]=255;return;}b[i]=Math.round(b[i]*(1-a)+c[0]*a);b[i+1]=Math.round(b[i+1]*(1-a)+c[1]*a);b[i+2]=Math.round(b[i+2]*(1-a)+c[2]*a);b[i+3]=255;}
function rrect(b,x1,y1,x2,y2,r,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const dx=Math.max(x1+r-x,0,x-(x2-r));const dy=Math.max(y1+r-y,0,y-(y2-r));if(dx*dx+dy*dy<=r*r)px(b,x,y,c);}}
function rect(b,x1,y1,x2,y2,c){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)px(b,x,y,c);}
function circle(b,cx,cy,r,c){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)px(b,x,y,c);}
function line(b,x1,y1,x2,y2,w,c){const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1))*2;for(let i=0;i<=steps;i++){const t=i/steps;const x=Math.round(x1+(x2-x1)*t),y=Math.round(y1+(y2-y1)*t);for(let dy=-w;dy<=w;dy++)for(let dx=-w;dx<=w;dx++)if(dx*dx+dy*dy<=w*w)px(b,x+dx,y+dy,c);}}
function text(b,t,x,y,size,c,bold=false){
  // tiny 4x6 bitmap font
  const font={
    'A':["0110","1001","1001","1111","1001","1001"],'B':["1110","1001","1110","1001","1001","1110"],
    'C':["0111","1000","1000","1000","1000","0111"],'D':["1110","1001","1001","1001","1001","1110"],
    'E':["1111","1000","1110","1000","1000","1111"],'F':["1111","1000","1110","1000","1000","1000"],
    'G':["0111","1000","1011","1001","1001","0111"],'H':["1001","1001","1111","1001","1001","1001"],
    'I':["1110","0100","0100","0100","0100","1110"],'J':["0011","0010","0010","1010","1010","0100"],
    'K':["1001","1010","1100","1010","1001","1001"],'L':["1000","1000","1000","1000","1000","1111"],
    'M':["1001","1111","1111","1001","1001","1001"],'N':["1001","1101","1011","1001","1001","1001"],
    'O':["0110","1001","1001","1001","1001","0110"],'P':["1110","1001","1110","1000","1000","1000"],
    'Q':["0110","1001","1001","1011","1010","0101"],'R':["1110","1001","1110","1010","1001","1001"],
    'S':["0111","1000","0110","0001","0001","1110"],'T':["1111","0100","0100","0100","0100","0100"],
    'U':["1001","1001","1001","1001","1001","0110"],'V':["1001","1001","1001","1001","0110","0100"],
    'W':["1001","1001","1001","1111","1111","1001"],'X':["1001","1001","0110","0110","1001","1001"],
    'Y':["1001","1001","0110","0100","0100","0100"],'Z':["1111","0001","0010","0100","1000","1111"],
    '0':["0111","1001","1011","1101","1001","0111"],'1':["0100","1100","0100","0100","0100","1110"],
    '2':["0110","1001","0010","0100","1000","1111"],'3':["1110","0001","0110","0001","0001","1110"],
    '4':["0010","0110","1010","1111","0010","0010"],'5':["1111","1000","1110","0001","0001","1110"],
    '6':["0111","1000","1110","1001","1001","0110"],'7':["1111","0001","0010","0100","1000","1000"],
    '8':["0110","1001","0110","1001","1001","0110"],'9':["0110","1001","0111","0001","0001","1110"],
    ' ':[],'.':["0000","0000","0000","0000","0000","1100"],',':["0000","0000","0000","1100","0100","1000"],
    '!':["0100","0100","0100","0100","0000","0100"],'?':["0110","1001","0010","0100","0000","0100"],
    '-':["0000","0000","1110","0000","0000","0000"],'/':["0001","0010","0010","0100","1000","1000"],
    ':':["0000","0100","0000","0000","0100","0000"],'+':["0000","0100","1110","0100","0000","0000"],
    "'":["0100","0100","0000","0000","0000","0000"],'"':["1010","1010","0000","0000","0000","0000"],
    '#':["0101","1111","0101","1111","0101","0000"],
  };
  const cx0=x;
  let curX=x;
  for(const ch of t.toUpperCase()){
    const g=font[ch]||[];
    for(let yy=0;yy<6;yy++){
      const row=g[yy]||'';
      for(let xx=0;xx<4;xx++){
        if(row[xx]==='1') rect(b,curX+xx*size, y+yy*size, curX+xx*size+size-1, y+yy*size+size-1,c);
      }
    }
    curX += 5*size;
  }
}

function phoneFrame(bg){
  const b=newBuf(bg);
  rrect(b,8,8,W-8,H-8,R,[20,20,25]);
  rrect(b,20,20,W-20,H-20,R,bg);
  // notch
  rrect(b,W/2-60,38,W/2+60,64,14,[0,0,0]);
  return b;
}

// ========== UI #1: AURORA (dark glassmorphism) ==========
function ui1(){
  const b=phoneFrame([11,17,32]);
  // status bar
  text(b,'8:28',40,60,4,[180,200,210],true);
  // greeting
  text(b,'HI HR',40,130,12,[255,255,255],true);
  text(b,'HR ADMINISTRATOR',40,205,5,[140,160,180]);
  // avatar
  circle(b,W-80,160,40,[16,185,129]);
  text(b,'HR',W-100,150,6,[255,255,255],true);
  // attendance card (glass)
  for(let a=0;a<8;a++) rrect(b,40-a,280-a,W-40+a,460+a,28,[255,255,255,1-a*0.12]);
  rrect(b,40,280,W-40,460,28,[255,255,255,30]);
  text(b,'TODAY ATTENDANCE',60,310,4,[140,200,220]);
  text(b,'NOT MARKED',60,350,10,[255,255,255],true);
  rrect(b,60,410,W-60,485,22,[16,185,129,230]);
  text(b,'MARK ATTENDANCE',130,440,5,[255,255,255],true);
  // stats
  rrect(b,40,490,W-40,620,22,[255,255,255,25]);
  text(b,'0',95,520,10,[16,185,129],true);
  text(b,'PRESENT',80,575,4,[140,160,180]);
  text(b,'0',265,520,10,[245,158,11],true);
  text(b,'LATE',265,575,4,[140,160,180]);
  text(b,'0',430,520,10,[59,130,246],true);
  text(b,'WFH',430,575,4,[140,160,180]);
  // quick actions
  text(b,'QUICK ACTIONS',40,660,5,[255,255,255],true);
  const tiles=[['LEAVE','16,185,129'],['TEAM','124,58,237'],['WISHES','219,39,119'],['HELPDESK','59,130,246']];
  tiles.forEach((t,i)=>{
    const x=40+(i%2)*240, y=690+Math.floor(i/2)*120;
    rrect(b,x,y,x+210,y+100,20,[255,255,255,25]);
    circle(b,x+50,y+50,24,eval('['+t[1]+']'));
    text(b,t[0],x+90,y+42,5,[255,255,255],true);
  });
  // bottom nav
  rrect(b,0,H-110,W,H,30,[20,25,40]);
  [0,1,2,3,4].forEach(i=>circle(b,70+i*100,H-60,12,i===0?[16,185,129]:[80,90,110]));
  return b;
}

// ========== UI #2: EDITORIAL (minimal white) ==========
function ui2(){
  const b=phoneFrame([255,255,255]);
  rrect(b,20,20,W-20,H-20,R,[255,255,255]);
  // brand bar
  rect(b,40,80,80,84,[6,95,70]);
  text(b,'P',54,100,18,[255,255,255],true);
  text(b,'PULSE HR',100,90,7,[15,23,42],true);
  text(b,'HR ADMIN',100,130,4,[100,116,139]);
  text(b,'HI,',40,200,9,[100,116,139]);
  text(b,'HR',40,250,22,[15,23,42],true);
  rect(b,40,310,W-80,312,[6,95,70]);
  text(b,'TODAY',60,340,5,[167,243,208]);
  text(b,'NOT MARKED',60,380,11,[255,255,255],true);
  rrect(b,60,440,W-60,500,10,[255,255,255]);
  text(b,'MARK ATTENDANCE',130,460,5,[6,95,70],true);
  // month stats — thin lines
  text(b,'THIS MONTH',40,560,5,[15,23,42],true);
  rect(b,40,590,W-80,592,[226,232,240]);
  text(b,'0',60,610,14,[6,95,70],true); text(b,'PRESENT',60,650,4,[100,116,139]);
  text(b,'0',200,610,14,[245,158,11],true); text(b,'LATE',200,650,4,[100,116,139]);
  text(b,'0',340,610,14,[59,130,246],true); text(b,'WFH',340,650,4,[100,116,139]);
  text(b,'QUICK ACTIONS',40,720,5,[15,23,42],true);
  ['LEAVE','TEAM','WISHES','HELPDESK'].forEach((t,i)=>{
    const x=40+(i%2)*240, y=750+Math.floor(i/2)*100;
    rrect(b,x,y,x+210,y+100,8,[248,250,252]);
    rect(b,x+20,y+20,x+26,y+80,[6,95,70]);
    text(b,t,x+40,y+50,5,[15,23,42],true);
  });
  rect(b,0,H-90,W,H-1,[241,245,249]);
  [0,1,2,3,4].forEach(i=>{
    const x=70+i*100;
    if(i===0)rect(b,x-12,H-60,x+12,H-56,[6,95,70]);
    circle(b,x,H-70,8,i===0?[6,95,70]:[148,163,184]);
  });
  return b;
}

// ========== UI #3: VIBRANT (HROne style) ==========
function ui3(){
  const b=phoneFrame([245,247,250]);
  // top brand header
  rrect(b,0,0,W,280,0,[6,95,70]);
  rrect(b,0,220,W,360,36,[245,247,250]);
  text(b,'HI HR!',40,90,14,[255,255,255],true);
  text(b,'HR ADMIN  UTL0001',40,140,5,[209,250,229]);
  circle(b,W-80,120,36,[255,255,255]);
  text(b,'HR',W-98,108,7,[6,95,70],true);
  // attendance card
  rrect(b,40,220,W-40,380,24,[255,255,255]);
  text(b,"TODAY'S ATTENDANCE",60,250,4,[100,116,139]);
  rrect(b,W-150,244,W-60,280,14,[245,158,11]);
  text(b,'PENDING',W-132,253,4,[255,255,255],true);
  text(b,'NOT MARKED YET',60,300,9,[15,23,42],true);
  rrect(b,60,340,W-60,420,16,[6,95,70]);
  text(b,'MARK ATTENDANCE',150,370,6,[255,255,255],true);
  // stats cards
  [['0','PRESENT',[22,163,74]],['0','LATE',[245,158,11]],['0','WFH',[37,99,235]]].forEach((s,i)=>{
    const x=40+i*160;
    rrect(b,x,420,x+145,530,18,[255,255,255]);
    rect(b,x+20,445,x+30,510,s[2]);
    text(b,s[0],x+50,455,14,s[2],true);
    text(b,s[1],x+50,495,4,[100,116,139]);
  });
  text(b,'QUICK ACTIONS',40,590,6,[15,23,42],true);
  const tiles=[['APPLY LEAVE',[124,58,237]],['REGULARISE',[245,158,11]],['TEAM',[13,148,136]],['WISHES',[219,39,119]],['HELPDESK',[37,99,235]],['PROFILE',[6,95,70]]];
  tiles.forEach((t,i)=>{
    const x=35+(i%3)*170, y=620+Math.floor(i/3)*150;
    rrect(b,x,y,x+155,y+130,20,[255,255,255]);
    circle(b,x+48,y+50,28,t[1].map(v=>Math.round(v*0.15+255*0.85)));
    circle(b,x+48,y+50,18,t[1]);
    text(b,t[0],x+15,y+95,4,[15,23,42],true);
  });
  rect(b,0,H-90,W,H,[255,255,255]);
  [['HOME',true],['TIME',false],['SOCIAL',false],['TEAM',false],['MORE',false]].forEach((t,i)=>{
    const x=50+i*100;
    circle(b,x,H-60,10,t[0]?[6,95,70]:[148,163,184]);
    text(b,t[0],x-15,H-32,3,t[0]?[6,95,70]:[148,163,184],true);
  });
  return b;
}

// ========== UI #4: SOFT NEO ==========
function ui4(){
  const b=phoneFrame([238,242,245]);
  rrect(b,20,20,W-20,H-20,R,[238,242,245]);
  // greeting card with neumorphic shadow
  rrect(b,40,90,W-40,200,28,[255,255,255]);
  rrect(b,40,90,W-40,200,28,[255,255,255]);
  text(b,'GOOD MORNING',60,120,5,[130,140,150]);
  text(b,'HR',60,150,14,[15,23,42],true);
  circle(b,W-80,150,36,[6,95,70]);
  text(b,'HR',W-98,138,6,[255,255,255],true);
  // attendance card (inset)
  rrect(b,40,230,W-40,420,28,[238,242,245]);
  text(b,'TODAY',60,260,4,[130,140,150]);
  text(b,'Punch In',60,290,9,[15,23,42],true);
  // big round button
  circle(b,W/2,370,60,[6,95,70]);
  circle(b,W/2,370,48,[16,185,129]);
  text(b,'IN',W/2-20,355,9,[255,255,255],true);
  rrect(b,80,450,W-80,490,12,[255,255,255]);
  text(b,'biometric enabled',160,460,4,[130,140,150]);
  // stats
  rrect(b,40,450,180,540,20,[255,255,255]);
  text(b,'0',70,480,10,[6,95,70],true); text(b,'PRESENT',70,515,3,[130,140,150]);
  rrect(b,200,450,340,540,20,[255,255,255]);
  text(b,'0',225,480,10,[245,158,11],true); text(b,'LATE',225,515,3,[130,140,150]);
  rrect(b,360,450,500,540,20,[255,255,255]);
  text(b,'0',385,480,10,[59,130,246],true); text(b,'WFH',385,515,3,[130,140,150]);
  text(b,'QUICK ACTIONS',40,590,5,[15,23,42],true);
  ['LEAVE','TEAM','WISHES','PROFILE'].forEach((t,i)=>{
    const x=40+i*120;
    rrect(b,x,620,x+110,720,20,[255,255,255]);
    circle(b,x+55,670,18,[6,95,70]);
    text(b,t[0],x+50,700,3,[15,23,42],true);
  });
  // bottom nav
  rrect(b,40,H-100,W-40,H-30,30,[255,255,255]);
  [0,1,2,3,4].forEach(i=>circle(b,80+i*95,H-65,10,i===0?[6,95,70]:[180,190,200]));
  return b;
}

// ========== UI #5: MATERIAL YOU ==========
function ui5(){
  const b=phoneFrame([250,245,255]);
  rrect(b,0,0,W,280,0,[6,95,70]);
  rrect(b,0,240,W,380,36,[250,245,255]);
  // status
  text(b,'8:28',40,60,4,[255,255,255]);
  text(b,'PULSE HR',40,100,7,[255,255,255],true);
  text(b,'Hi HR, attendance pending',40,145,4,[209,250,229]);
  circle(b,W-70,120,30,[255,255,255]);
  // floating FAB
  circle(b,W-80,290,36,[16,185,129]);
  text(b,'+',W-90,275,14,[255,255,255],true);
  // material cards
  rrect(b,40,310,W-40,470,20,[255,255,255]);
  text(b,"Today's attendance",60,335,5,[15,23,42],true);
  rrect(b,60,380,W-60,450,14,[236,253,245]);
  circle(b,90,415,16,[6,95,70]);
  text(b,'Not marked yet',120,405,5,[6,95,70],true);
  rrect(b,60,480,W-60,540,30,[6,95,70]);
  text(b,'PUNCH IN',210,505,6,[255,255,255],true);
  // segmented stats
  rrect(b,40,490,210,620,16,[255,255,255]);
  rrect(b,230,490,400,620,16,[255,255,255]);
  rrect(b,40,640,210,770,16,[255,255,255]);
  rrect(b,230,640,400,770,16,[255,255,255]);
  text(b,'0',60,520,10,[6,95,70],true); text(b,'Present',60,555,3,[100,116,139]);
  text(b,'0',250,520,10,[245,158,11],true); text(b,'Late',250,555,3,[100,116,139]);
  text(b,'0',60,670,10,[59,130,246],true); text(b,'WFH',60,705,3,[100,116,139]);
  text(b,'4',250,670,1,[219,39,119],true); text(b,'Approvals',250,705,3,[100,116,139]);
  // nav pill
  rrect(b,40,H-90,W-40,H-30,30,[6,95,70]);
  [['HOME',true],['TIME',false],['SOCIAL',false],['TEAM',false]].forEach((t,i)=>{
    const x=70+i*110;
    if(t[0])rrect(b,x-20,H-80,x+60,H-40,20,[16,185,129]);
    text(b,t[0],t[0]?x-5:x,t[0]?H-67:H-62,3,[255,255,255],t[0]);
  });
  return b;
}

[
  ['UI1-aurora',ui1],
  ['UI2-editorial',ui2],
  ['UI3-vibrant',ui3],
  ['UI4-softneo',ui4],
  ['UI5-material',ui5],
].forEach(([n,fn])=>writePng(path.join(out,n+'.png'),fn()));
console.log('5 UI mockups generated');
