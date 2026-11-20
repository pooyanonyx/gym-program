'use strict';
/* =====================================================================
   exercises2.js — پوز و تجهیزات حرکت‌های اضافه (کتابخانه سفارشی)
   ===================================================================== */

/* ---- کمکی: بدن مستقیم روی پنجه‌ها (شنا / کوهنورد) ، سر به راست ---- */
function proneKey(beta,ax,ay,hand,extra){
  var b=beta*RD,o={hx:ax+82*Math.cos(b),hy:ay-82*Math.sin(b),tr:90-beta,th:-(90-beta),k:0,hd:-22,hndN:hand,ftN:8,sgA:-1};
  return Object.assign(o,extra||{});
}

/* ---- شنا ---- */
EX.pu={mus:{p:['chest','triceps'],s:['delts','core']},yaw:32,z:{w:16,s:15},
 base:{},
 keys:(function(){
  var H=[189,223],t=proneKey(19,58,209,H),bt=proneKey(5,58,209,H);
  return [{p:t,d:900,l:.4},{p:bt,d:900,l:1},{p:bt,d:150,l:1},{p:t,d:700,l:.4}];
 })(),
 rb3:MAT};

/* ---- اسکات با وزن بدن ---- */
EX.sq={mus:{p:['quads','glutes'],s:['hams','core']},yaw:32,z:{f:14},
 base:{anc:STD,ftN:90},
 keys:cyc({tr:0,th:0,k:0,ua:6,e:15,hd:0},{tr:30,th:85,k:112,ua:82,e:4,hd:-8},1300,200,900,250,.15,1)};

/* ---- لانج ---- */
EX.lg={mus:{p:['quads','glutes'],s:['hams','calves','core']},yaw:30,z:{f:15},
 base:{ftN:90,ua:8,e:30,hd:0},
 keys:cyc({hx:165,hy:146,tr:2,ankN:[185,225],ankF:[140,222],ftF:70},
          {hx:163,hy:190,tr:5,ankN:[200,225],ankF:[118,213],ftF:40},1000,250,1100,250,.2,1)};

/* ---- کرانچ شکم ---- */
EX.cn={mus:{p:['core'],s:[]},yaw:34,
 base:{hx:150,hy:219,hd:0,ankN:[198,225],ftN:90,ua:-130,e:-70},
 keys:cyc({tr:-90,hd:0},{tr:-48,hd:14},1000,350,1200,300,.2,1),
 rb3:MAT};

/* ---- سوپرمن (دمر) ---- */
EX.sw={mus:{p:['lback','glutes'],s:['hams','delts','back']},flip:true,yaw:34,z:{w:10},
 base:{hx:160,hy:219,tr:-90,hd:-4,th:90,k:0,pl:-25,ua:-90,e:0},
 keys:cyc({tr:-90,hd:0,th:90,ua:-90},{tr:-104,hd:12,th:68,ua:-68},1000,1800,1000,500,.2,1),
 rb3:MAT};

/* ---- کوهنورد ---- */
EX.mc={mus:{p:['core','quads'],s:['delts','chest','hams']},yaw:30,z:{w:14,s:15},
 base:{},
 keys:(function(){
  var H=[189,223],a=proneKey(19,58,209,H,{ankN:[118,206],ftN:40,ankF:[58,209],ftF:8}),
      b=proneKey(19,58,209,H,{ankN:[58,209],ftN:8,ankF:[118,206],ftF:40});
  return [{p:a,d:300,l:1},{p:b,d:300,l:1}];
 })(),
 rb3:MAT};

/* ---- اسکات دیواری ---- */
EX.ws={mus:{p:['quads','glutes'],s:['calves','core']},yaw:30,z:{f:14},
 base:{hx:150,hy:185,tr:0,hd:0,th:90,k:90,ftN:90,ua:50,e:40},
 keys:[{p:{},d:1800,l:.7},{p:{hy:186},d:1800,l:1}],
 rb3:function(P,p,J){return box3(J,122,30,136,230,56,'mt2')}};

/* ---- پرس سرشانه دستگاه ---- */
EX.shp={mus:{p:['delts','triceps'],s:['chest','back']},yaw:34,z:{w:18},
 base:{hx:140,hy:186,tr:-3,hd:3,ankN:[176,225],ftN:90},
 keys:cyc({hndN:[150,128]},{hndN:[146,78]},1000,200,1500,200,.3,1),
 pl:function(){return stack(48,60,30,140)+R(128,206,12,24,'mt2',2)+R(60,226,190,5,'mt2',2)},
 rb3:function(P,p,J){return box3(J,110,197,162,206,24,'pd')+box3(J,119,100,129,196,20,'pd')},
 rf:function(P,p,J){
  return Ln(Jp(J,[78,110],18),Jp(J,P.nW,18),'mt',5)+Ln(Jp(J,[78,110],-18),Jp(J,P.fW,-18),'mt',5)+Ci(Jp(J,P.nW,18),5,'mt');
 }};

/* ---- جلو بازو دمبل ---- */
EX.bc={mus:{p:['biceps'],s:['fore','delts']},yaw:34,z:{w:17,s:16},
 base:{anc:STD,ftN:90,ua:3,e:5},
 keys:cyc({e:6},{e:138},1000,300,1300,300,.2,1),
 rf:function(P,p,J){
  var s='';
  [[P.nW,17],[P.fW,-17]].forEach(function(x){var a=Jp(J,x[0],x[1]-6),b=Jp(J,x[0],x[1]+6);s+=Ln(a,b,'mt2',3)+Ci(a,4.5,'pd')+Ci(b,4.5,'pd')});
  return s;
 }};

/* ---- پشت بازو سیم‌کش ---- */
EX.tpd={mus:{p:['triceps'],s:['delts','core']},yaw:32,z:{w:14},
 base:{anc:STD,ftN:90,tr:7,hd:-2,ua:6,e:0},
 keys:cyc({e:112},{e:2},900,250,1500,250,.2,1),
 pl:function(){return R(236,226,64,5,'mt2',2)},
 rb3:function(P,p,J){return box3(J,262,36,276,230,16,'mt2')+Ci(Jp(J,[235,44],0),7,'mt')},
 rf:function(P,p,J){
  var a=Jp(J,P.nW,14),b=Jp(J,P.fW,-14);
  return Ln(Jp(J,[235,44],0),a,'ac',1.2)+Ln(Jp(J,[235,44],0),b,'ac',1.2)+Ln(a,b,'mt',4.5);
 }};

/* ---- ددلیفت رومانیایی ---- */
EX.rdl={mus:{p:['hams','glutes'],s:['lback','fore']},yaw:32,z:{w:14},
 base:{anc:STD,ftN:90,ua:2,e:0},
 keys:cyc({tr:0,th:0,k:0,hd:0},{tr:72,th:20,k:16,hd:-30},1400,350,1300,300,.2,1),
 rf:function(P,p,J){
  var s='';
  [[P.nW,14],[P.fW,-14]].forEach(function(x){var a=Jp(J,x[0],x[1]-6),b=Jp(J,x[0],x[1]+6);s+=Ln(a,b,'mt2',3)+Ci(a,4.5,'pd')+Ci(b,4.5,'pd')});
  return s;
 }};

/* ---- هیپ ترست ---- */
EX.ht={mus:{p:['glutes'],s:['hams','core','quads']},yaw:34,
 base:{ankN:[205,225],ftN:90,ua:20,e:30,hd:6},
 keys:cyc({hx:160,hy:213,tr:-66},{hx:165,hy:190,tr:-92,hd:20},1000,700,1100,500,.2,1),
 rb3:function(P,p,J){return box3(J,70,203,124,230,22,'mt2')}};

/* ---- جلو ران دستگاه ---- */
EX.le={mus:{p:['quads'],s:[]},yaw:48,pit:16,z:{h:9,f:10,w:20,s:16},
 base:{hx:140,hy:184,tr:-3,hd:3,th:90,k:90,ftN:90,hndN:[152,180]},
 keys:cyc({k:90},{k:4},1100,500,1500,250,.2,1),
 pl:function(){return R(86,226,148,4,'mt2',2)},
 rb3:function(P,p,J){return box3(J,110,196,170,206,26,'pd')+box3(J,118,100,128,196,24,'pd')},
 rf:function(P,p,J){
  var s='',a=P.nA;
  [1,-1].forEach(function(sg){
   var u=Jp(J,[P.nK[0],P.nK[1]+4],sg*13),v=Jp(J,[a[0]+7,a[1]+2],sg*13);
   s+=Ln(Jp(J,[P.nK[0]-6,P.nK[1]+14],sg*15),Jp(J,[P.nK[0]-6,P.nK[1]+40],sg*15),'mt2',4)+Ln(u,v,'pd',7);
  });
  return s;
 }};

/* ---- بالا بردن پا ---- */
EX.lr={mus:{p:['core'],s:['quads']},yaw:34,
 base:{hx:150,hy:219,tr:-90,hd:0,k:0,ua:90,e:0},
 keys:cyc({th:92},{th:162},1000,400,1300,300,.2,1),
 rb3:MAT};

/* ---- تردمیل ---- */
(function(){
 var A={hx:160,hy:147,tr:6,th:60,k:92,thF:-18,kF:14,ftN:100,ftF:40,ua:-42,e:70,uaF:46,eF:70},
     M1={hx:160,hy:140,tr:6,th:18,k:66,thF:18,kF:96,ftN:80,ftF:70,ua:0,e:75,uaF:0,eF:75},
     B={hx:160,hy:147,tr:6,th:-18,k:14,thF:60,kF:92,ftN:40,ftF:100,ua:46,e:70,uaF:-42,eF:70},
     M2={hx:160,hy:140,tr:6,th:18,k:96,thF:18,kF:66,ftN:70,ftF:80,ua:0,e:75,uaF:0,eF:75};
 EX.tm={mus:{p:['quads','hams','calves'],s:['glutes','core']},base:{},yaw:30,z:{f:12},
  keys:[{p:A,d:260,l:.6},{p:M1,d:260,l:.3},{p:B,d:260,l:.6},{p:M2,d:260,l:.3}],
  rb3:function(P,p,J){return box3(J,40,226,250,234,30,'pd')},
  rf:function(P,p,J){return Ln(Jp(J,[250,226],-30),Jp(J,[250,90],-30),'mt2',6)+Ln(Jp(J,[250,226],30),Jp(J,[250,90],30),'mt2',6)+Ln(Jp(J,[250,96],-30),Jp(J,[250,96],30),'mt',6)}};
})();

/* ---- دوچرخه ثابت ---- */
(function(){
 var C=[150,199],r=18,keys=[],i,a,b,hp={hx:118,hy:158,tr:34,hd:-12,hndN:[194,128],ua:0,e:0,ftN:90};
 for(i=0;i<8;i++){
  a=i*45*RD;b=a+Math.PI;
  keys.push({p:Object.assign({},hp,{ankN:[C[0]+Math.sin(a)*r,C[1]+Math.cos(a)*r],ankF:[C[0]+Math.sin(b)*r,C[1]+Math.cos(b)*r]}),d:140,l:.5});
 }
 EX.bk={mus:{p:['quads','glutes'],s:['hams','calves']},base:{},yaw:30,z:{w:14},keys:keys,
  rb3:function(P,p,J){
   var s=Ln(Jp(J,C,0),Jp(J,[112,171],0),'mt2',5)+Ln(Jp(J,[112,171],0),Jp(J,[112,225],0),'mt2',6)
    +Ln(Jp(J,C,0),Jp(J,[198,150],0),'mt2',5)+Ln(Jp(J,[198,150],0),Jp(J,[198,225],0),'mt2',6)+Ln(Jp(J,[198,150],0),Jp(J,[194,126],0),'mt',5)
    +box3(J,98,172,132,177,13,'pd')+box3(J,150,222,242,230,20,'mt2').replace(/<polygon/g,'<polygon');
   var f=Jp(J,[198,208],0);
   return s+Ci(f,18,'mt2')+Ci(f,6,'mt');
  },
  rf:function(P,p,J){
   var s='',z=11;
   s+=Ln(Jp(J,C,z),Jp(J,P.nA,z),'mt',4)+Ln(Jp(J,C,-z),Jp(J,P.fA,-z),'mt',4)+Ln(Jp(J,[194,128],14),Jp(J,[194,128],-14),'mt',5);
   return s;
  }};
})();

/* ---- پرس سینه با دمبل ---- */
EX.bp={mus:{p:['chest','triceps'],s:['delts']},yaw:34,z:{w:22,s:17},
 base:{hx:165,hy:191,tr:-90,hd:0,ankN:[205,225],ftN:90},
 keys:cyc({hndN:[112,128]},{hndN:[114,176]},1000,300,1300,300,.2,1).map(function(k,i){return k}),
 rb3:function(P,p,J){return box3(J,70,203,236,214,24,'pd')+box3(J,76,214,88,230,18,'mt2')+box3(J,218,214,230,230,18,'mt2')},
 rf:function(P,p,J){
  var s='';
  [[P.nW,22],[P.fW,-22]].forEach(function(x){var a=Jp(J,x[0],x[1]-6),b=Jp(J,x[0],x[1]+6);s+=Ln(a,b,'mt2',3)+Ci(a,4.5,'pd')+Ci(b,4.5,'pd')});
  return s;
 }};

/* آماده‌سازی کلیدهای حرکت‌های جدید */
Object.keys(EX).forEach(function(id){
  var ex=EX[id];if(ex.total!=null)return;
  ex.total=0;
  ex.keys.forEach(function(k){k.p=Object.assign({},BASE,ex.base||{},k.p);ex.total+=k.d});
});
