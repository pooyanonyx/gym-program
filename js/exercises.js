'use strict';
/* =====================================================================
   exercises.js — پوز و تجهیزات هر حرکت
   pl  : تجهیزات تخت (در صفحه ساجیتال ، دو نسخه برای عمق)
   rb3 : تجهیزات سه‌بعدی پشت آدمک  (J = تابع دوربین)
   rf  : تجهیزات سه‌بعدی جلوی آدمک
   z   : عمق مفاصل  h=لگن  s=شانه  f=پا  w=دست
   ===================================================================== */
const BASE={hx:160,hy:143,tr:0,hd:0,th:0,k:0,pl:0,ua:6,e:15};
const STD=[160,225];
const MAT=function(P,p,J){return box3(J,36,228.4,284,230,44,'pd')};
const EX={};

/* ---- پرس پا ---- */
EX.lp={mus:{p:['quads','glutes'],s:['hams','calves']},yaw:30,
 base:{hx:100,hy:190,tr:-40,hd:32,ftN:-140,hndN:[112,176]},
 keys:cyc({ankN:[146,151.4]},{ankN:[159.7,139.9]},1100,250,1600,200,.2,1),
 pl:function(){return R(84,209,14,21,'mt2',2)+R(50,226,190,5,'mt2',2)+Ln([148,186],[212,132],'mt2',5)},
 rb3:function(P,p,J){
  var pd=[.766,-.643],t=[.643,.766],c=[P.nA[0]+pd[0]*7,P.nA[1]+pd[1]*7],a=[c[0]-t[0]*26,c[1]-t[1]*26],b=[c[0]+t[0]*26,c[1]+t[1]*26];
  return box3(J,70,200,134,209,24,'pd')
   +poly([Jp(J,a,-34),Jp(J,b,-34),Jp(J,b,34),Jp(J,a,34)],'mt')+poly([Jp(J,a,-34),Jp(J,b,-34),Jp(J,b,34),Jp(J,a,34)],'hl')
   +Ln(Jp(J,[90,199],-16),Jp(J,[46,147],-16),'pd',10)+Ln(Jp(J,[90,199],16),Jp(J,[46,147],16),'pd',10)
   +Ln(Jp(J,c,0),Jp(J,[c[0]+t[0]*28,c[1]+t[1]*28],0),'mt2',4);
 },
 rf:function(P,p,J){return Ci(Jp(J,P.nW,16),4,'mt')}};

/* ---- اسکات با کش ---- */
EX.bs={mus:{p:['quads','glutes'],s:['hams','core','lback']},yaw:32,z:{h:9,f:14},
 base:{anc:STD,ftN:90},
 keys:cyc({tr:0,th:0,k:0,ua:6,e:15,hd:0},{tr:32,th:85,k:112,ua:82,e:4,hd:-8},1400,150,900,300,.15,1),
 rb3:function(P,p,J){return box3(J,104,198,150,230,28,'mt2')},
 rf:function(P,p,J){
  var u=unit(P.hip,P.nK),d=[P.nK[0]-P.hip[0],P.nK[1]-P.hip[1]],c=[P.hip[0]+d[0]*.8,P.hip[1]+d[1]*.8],n=[u[1],-u[0]],zb=12;
  var f1=[c[0]+n[0]*9,c[1]+n[1]*9],b1=[c[0]-n[0]*9,c[1]-n[1]*9];
  return Ln(Jp(J,b1,zb),Jp(J,f1,zb),'ac',3.5)+Ln(Jp(J,b1,-zb),Jp(J,f1,-zb),'ac',3.5)+Ln(Jp(J,f1,zb),Jp(J,f1,-zb),'ac',3)+Ln(Jp(J,b1,zb),Jp(J,b1,-zb),'ac',3);
 }};

/* ---- جلو پشت پا (دمر) ---- */
EX.lc={mus:{p:['hams'],s:['calves','glutes']},flip:true,yaw:34,
 base:{hx:125,hy:192,tr:-90,hd:0,th:90,k:0,pl:-25,ua:-120,e:20},
 keys:cyc({k:4},{k:108},1100,300,1700,200,.2,1),
 pl:function(){return stack(250,90,36,140)},
 rb3:function(P,p,J){return box3(J,60,204,172,213,20,'pd')+box3(J,70,213,79,230,16,'mt2')+box3(J,150,213,159,230,16,'mt2')+box3(J,168,206,186,230,16,'mt2')},
 rf:function(P,p,J){
  var d=unit(P.nK,P.nA),n=[d[1],-d[0]],pc=[P.nA[0]+n[0]*5,P.nA[1]+n[1]*5],c=Jp(J,pc,10);
  return Ln(Jp(J,[176,208],10),c,'mt',6)+Ci(c,6,'pd');
 }};

/* ---- پل باسن ---- */
const GBA={hx:150,hy:220,tr:-90,hd:0},GBB={hx:142.3,hy:190,tr:-121,hd:31};
EX.gb={mus:{p:['glutes','hams'],s:['core','lback']},yaw:34,
 base:{ankN:[198,225],ftN:90,ua:90,e:0},
 keys:cyc(GBA,GBB,1000,700,1100,500,.1,1),
 rb3:MAT};

/* ---- بارفیکس کمکی ---- */
EX.ap={mus:{p:['lats','biceps'],s:['back','delts','fore','core']},yaw:30,z:{w:22,s:15},
 base:{tr:-8,hndN:[196,52],th:8,k:98,ftN:-75},
 keys:cyc({hx:197.5,hy:163.5},{hx:186,hy:123.5},1300,300,2400,300,.2,1),
 pl:function(){return stack(258,64,34,166)},
 rb3:function(P,p,J){
  var kx=P.nK[0],ky=P.nK[1];
  return Ln(Jp(J,[249,30],-30),Jp(J,[249,230],-30),'mt2',8)+Ln(Jp(J,[249,30],30),Jp(J,[249,230],30),'mt2',8)
   +box3(J,kx-30,ky+5,kx+18,ky+13,18,'pd')+Ln(Jp(J,[kx-8,ky+13],0),Jp(J,[kx-8,226],0),'mt2',8);
 },
 rf:function(P,p,J){
  var h=[196,52],a=Jp(J,h,-30),b=Jp(J,h,30);
  return Ln(Jp(J,[250,36],-30),Jp(J,[250,36],30),'mt2',6)+Ln(Jp(J,[244,40],-30),a,'mt',4)+Ln(Jp(J,[244,40],30),b,'mt',4)+Ln(a,b,'mt',5)+Ci(Jp(J,h,22),4.5,'mt');
 }};

/* ---- زیربغل سیم‌کش ---- */
EX.sr={mus:{p:['lats','back'],s:['biceps','lback','delts']},yaw:30,z:{w:8,f:12},
 base:{hx:150,hy:200,ankN:[205,206],ftN:180},
 keys:cyc({tr:12,hd:-12,hndN:[214,152]},{tr:-6,hd:6,hndN:[164,182]},1100,350,1500,250,.2,1),
 pl:function(){return R(140,220,12,10,'mt2',2)+R(100,226,190,5,'mt2',2)+R(274,150,10,80,'mt2',2)+Ci([279,205],8,'mt')},
 rb3:function(P,p,J){
  var a=Jp(J,[213,178],-24),b=Jp(J,[213,178],24),c=Jp(J,[213,226],24),d=Jp(J,[213,226],-24);
  return box3(J,120,211,180,220,20,'pd')+poly([a,b,c,d],'mt')+poly([a,b,c,d],'sd');
 },
 rf:function(P,p,J){return Ln(Jp(J,P.nW,8),Jp(J,[279,205],0),'ac',1.6)+Ln(Jp(J,P.nW,-9),Jp(J,P.nW,9),'mt',4)}};

/* ---- پلانک ---- */
EX.pl={mus:{p:['core'],s:['delts','glutes','quads']},yaw:36,z:{w:10},
 base:{hx:165.5,hy:202.7,tr:-81.8,hd:25,th:81.8,k:0,ftN:5,ua:0,e:90},
 keys:[{p:{hy:202.7,tr:-81.8},d:1700,l:.8},{p:{hy:201.2,tr:-82.4},d:1700,l:.95}],
 rb3:MAT};

/* ---- پرش مچ ---- */
EX.pg={mus:{p:['calves'],s:['quads','core']},
 base:{tr:0,hd:0},
 keys:[{p:{anc:[160,225],th:4,k:12,ftN:90,ua:18,e:40},d:240,l:1},{p:{anc:[160,207],th:0,k:2,ftN:52,ua:28,e:42},d:300,l:.3}]};

/* ---- پرش اسکات ---- */
(function(){
 var K0={anc:[160,225],tr:0,th:0,k:0,ftN:90,ua:6,e:15,hd:0},
     K1={anc:[160,225],tr:30,th:82,k:108,ftN:90,ua:80,e:5,hd:-8},
     K2={anc:[160,199],tr:4,th:0,k:2,ftN:50,ua:130,e:5,hd:0},
     K3={anc:[160,225],tr:24,th:62,k:86,ftN:90,ua:60,e:10,hd:-4};
 EX.sj={mus:{p:['quads','glutes'],s:['calves','hams','core']},base:{},z:{f:14},
  keys:[{p:K0,d:600,l:.1},{p:K1,d:260,l:1},{p:K2,d:260,l:.5},{p:K3,d:520,l:.7},{p:K0,d:500,l:.1}]};
})();

/* ---- دوی سرعت ---- */
(function(){
 var A={hx:160,hy:147,tr:12,th:70,k:100,thF:-22,kF:12,ftN:100,ftF:40,ua:-50,e:70,uaF:55,eF:70},
     M1={hx:160,hy:138,tr:12,th:20,k:70,thF:20,kF:100,ftN:80,ftF:70,ua:0,e:75,uaF:0,eF:75},
     B={hx:160,hy:147,tr:12,th:-22,k:12,thF:70,kF:100,ftN:40,ftF:100,ua:55,e:70,uaF:-50,eF:70},
     M2={hx:160,hy:138,tr:12,th:20,k:100,thF:20,kF:70,ftN:70,ftF:80,ua:0,e:75,uaF:0,eF:75};
 EX.sp={mus:{p:['hams','glutes','quads'],s:['calves','core']},base:{},yaw:24,
  keys:[{p:A,d:175,l:.9},{p:M1,d:175,l:.4},{p:B,d:175,l:.9},{p:M2,d:175,l:.4}]};
})();

/* ---- پرس سینه ---- */
EX.cp={mus:{p:['chest'],s:['delts','triceps']},yaw:34,z:{w:17},
 base:{hx:140,hy:186,tr:-3,hd:3,ankN:[176,225],ftN:90},
 keys:cyc({hndN:[157,140]},{hndN:[191,134]},1000,200,1600,200,.3,1),
 pl:function(){return stack(56,70,30,130)+R(128,206,12,24,'mt2',2)+R(60,226,190,5,'mt2',2)},
 rb3:function(P,p,J){return box3(J,110,197,162,206,24,'pd')+box3(J,119,120,129,196,20,'pd')},
 rf:function(P,p,J){
  return Ln(Jp(J,[98,134],17),Jp(J,P.nW,17),'mt',5)+Ln(Jp(J,[98,134],-17),Jp(J,P.fW,-17),'mt',5)+Ci(Jp(J,P.nW,17),5,'mt');
 }};

/* ---- لت ---- */
EX.lat={mus:{p:['lats'],s:['biceps','back','fore']},yaw:30,z:{w:24,s:16},
 base:{hx:150,hy:190,tr:-4,hd:0,ankN:[190,225],ftN:90},
 keys:cyc({hndN:[165,82],tr:-4,hd:0},{hndN:[172,134],tr:-8,hd:8},1100,300,1600,250,.2,1),
 pl:function(){return stack(262,40,36,190)+R(142,210,12,20,'mt2',2)+R(110,226,150,5,'mt2',2)+Ln([262,30],[172,30],'mt2',6)+Ci([172,30],7,'mt')},
 rb3:function(P,p,J){return box3(J,124,201,180,210,24,'pd')},
 rf:function(P,p,J){
  var h=P.nW,a=Jp(J,h,-24),b=Jp(J,h,24),u=unit(P.hip,P.nK),n=[u[1],-u[0]],d=[P.nK[0]-P.hip[0],P.nK[1]-P.hip[1]];
  var q1=[P.hip[0]+d[0]*.55+n[0]*11,P.hip[1]+d[1]*.55+n[1]*11],q2=[P.hip[0]+d[0]*.95+n[0]*11,P.hip[1]+d[1]*.95+n[1]*11];
  return Ln(Jp(J,[172,30],-24),a,'ac',1.4)+Ln(Jp(J,[172,30],24),b,'ac',1.4)+Ln(a,b,'mt',4.5)
   +Ln(Jp(J,q1,-8),Jp(J,q2,-8),'pd',8)+Ln(Jp(J,q1,8),Jp(J,q2,8),'pd',8);
 }};

/* ---- فیس پول ---- */
EX.fp={mus:{p:['back','delts'],s:['fore','lats']},yaw:32,z:{w:12},
 base:{anc:STD,ftN:90,sgA:1,tr:0,hd:0},
 keys:cyc({hndN:[214,95]},{hndN:[152,72]},1100,500,1500,250,.2,1),
 pl:function(){return R(262,60,12,170,'mt2',2)+Ci([268,92],8,'mt')+R(236,226,64,5,'mt2',2)},
 rf:function(P,p,J){
  return Ln(Jp(J,P.nW,12),Jp(J,[268,92],0),'ac',1.4)+Ln(Jp(J,P.fW,-12),Jp(J,[268,92],0),'ac',1.4)+Ci(Jp(J,P.nW,12),3.5,'ac');
 }};

/* ---- دد باگ ---- */
(function(){
 var T={hx:172,hy:219,tr:-90,hd:0,ua:180,e:0,uaF:180,eF:0,th:180,k:90,thF:180,kF:90},
     P1=Object.assign({},T,{ua:265,thF:95,kF:0}),
     P2=Object.assign({},T,{uaF:265,th:95,k:0});
 EX.db={mus:{p:['core'],s:['delts','quads']},base:{},yaw:36,rb3:MAT,
  keys:[{p:T,d:900,l:.3},{p:P1,d:500,l:1},{p:P1,d:900,l:1},{p:T,d:500,l:.3},{p:T,d:900,l:.3},{p:P2,d:500,l:1},{p:P2,d:900,l:1},{p:T,d:500,l:.3}]};
})();

/* ---- بالا رفتن از جعبه ---- */
EX.su={mus:{p:['quads','glutes'],s:['hams','calves']},yaw:30,
 base:{ankN:[160,197],ftN:90,ua:8,e:25,hd:0},
 keys:cyc({hx:148,hy:148,tr:10,ankF:[126,225],ftF:90},{hx:163,hy:122,tr:2,ankF:[176,162],ftF:100},1000,300,1300,300,.4,1),
 rb3:function(P,p,J){return box3(J,128,202,198,230,30,'mt2')}};

/* ---- پل باسن تک‌پا ---- */
EX.sg={mus:{p:['glutes'],s:['hams','core']},yaw:34,
 base:{ankN:[198,225],ftN:90,ua:90,e:0,thF:125,kF:0,plF:0},
 keys:cyc(GBA,GBB,1000,700,1100,500,.1,1),
 rb3:MAT};

/* ---- دور کردن پا (نشسته ، نمای تقریباً روبه‌رو) ---- */
EX.ha={mus:{p:['glutes'],s:['core']},yaw:52,pit:18,z:{h:9,f:11,w:22,s:17},
 base:{hx:140,hy:186,tr:-3,hd:3,th:90,k:90,ftN:90,hndN:[152,182],ab:0},
 keys:cyc({ab:0},{ab:34},1100,300,1500,300,.2,1),
 pl:function(){return R(86,226,148,4,'mt2',2)},
 rb3:function(P,p,J){return box3(J,110,196,170,206,26,'pd')+box3(J,118,100,128,196,24,'pd')},
 rf:function(P,p,J){
  var ab=p.ab||0,zk=10+42*Math.sin(ab*RD),zo=zk+10,kx=P.nK[0],ky=P.nK[1],s='';
  [1,-1].forEach(function(sg){
   var a=Jp(J,[kx,ky-8],sg*zo),b=Jp(J,[kx,ky+24],sg*zo);
   s+=Ln(a,b,'pd',9)+Ln(b,Jp(J,[kx-26,226],sg*(zo+14)),'mt',5);
  });
  return s;
 }};

/* ---- ساق پا ایستاده ---- */
EX.cr={mus:{p:['calves'],s:[]},yaw:30,z:{w:16},
 base:{ftN:90,tr:0,hd:0,ua:30,e:100},
 keys:cyc({anc:[160,213],ftN:96},{anc:[164,202.3],ftN:48},900,900,1200,300,.2,1),
 rb3:function(P,p,J){
  return box3(J,120,218,210,230,36,'mt2')+Ln(Jp(J,[95,40],-30),Jp(J,[95,230],-30),'mt',8)+Ln(Jp(J,[95,40],30),Jp(J,[95,230],30),'mt',8);
 },
 rf:function(P,p,J){
  var s=P.sh;
  return Ln(Jp(J,s,-18),Jp(J,s,18),'pd',14)+Ln(Jp(J,[s[0]-4,s[1]-2],-18),Jp(J,[95,s[1]-2],-30),'mt',5)+Ln(Jp(J,[s[0]-4,s[1]-2],18),Jp(J,[95,s[1]-2],30),'mt',5);
 }};

/* ---- آویزان ماندن ---- */
EX.dh={mus:{p:['fore','lats'],s:['biceps','delts','core']},yaw:30,z:{w:17},
 base:{hx:160,tr:0,hd:0,hndN:[160,30],th:0,k:50,ftN:10},
 keys:[{p:{hy:142},d:1800,l:.3},{p:{hy:137},d:1800,l:.8}],
 rb3:function(P,p,J){
  return Ln(Jp(J,[160,30],-42),Jp(J,[160,230],-42),'mt2',8)+Ln(Jp(J,[160,30],42),Jp(J,[160,230],42),'mt2',8)+Ln(Jp(J,[160,30],-42),Jp(J,[160,30],42),'mt',5);
 },
 rf:function(P,p,J){return Ci(Jp(J,P.nW,17),4,'mt')}};

/* ---- باردوم ---- */
(function(){
 var Q={hx:168,hy:178,tr:-77,hd:25,ua:3,e:-3,uaF:3,eF:-3,th:0,k:90,thF:0,kF:90,ftN:-90,ftF:-90},
     P1=Object.assign({},Q,{ua:90,e:0,thF:-90,kF:0,ftF:-60}),
     P2=Object.assign({},Q,{uaF:90,eF:0,th:-90,k:0,ftN:-60});
 EX.bd={mus:{p:['core','lback','glutes'],s:['delts','hams']},base:{},yaw:36,rb3:MAT,z:{h:8,f:9,w:14},
  keys:[{p:Q,d:1000,l:.3},{p:P1,d:1400,l:1},{p:P1,d:1000,l:1},{p:Q,d:300,l:.3},{p:Q,d:1000,l:.3},{p:P2,d:1400,l:1},{p:P2,d:1000,l:1},{p:Q,d:300,l:.3}]};
})();

/* آماده‌سازی کلیدها */
Object.keys(EX).forEach(function(id){
  var ex=EX[id];ex.total=0;
  ex.keys.forEach(function(k){k.p=Object.assign({},BASE,ex.base||{},k.p);ex.total+=k.d});
});
