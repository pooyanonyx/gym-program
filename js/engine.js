'use strict';
/* =====================================================================
   engine.js — موتور انیمیشن سه‌بعدی سبک
   - اسکلت در صفحه ساجیتال حل می‌شود (IK/FK) و هر مفصل یک عمق (z) دارد
   - دوربین قابل چرخش (yaw) و شیب (pitch) با نگاشت آفاین دقیق
   - عضلات با ماتریس همان دوربین روی بدن می‌نشینند
   ===================================================================== */

const MUSN={quads:'چهارسر ران',hams:'همسترینگ (پشت ران)',glutes:'سرینی',calves:'ساق پا',core:'شکم و مرکز بدن',chest:'سینه',lats:'زیربغل (لت)',back:'بالای کمر و کتف',lback:'پایین کمر',delts:'شانه',biceps:'جلو بازو',triceps:'پشت بازو',fore:'ساعد و مچ'};
/* seg: پاره‌خط ، side: +۱ جلو  −۱ پشت ، t: مرکز ، f: بخشی از طول ، r: ضخامت ، o: فاصله از محور
   k: limb = دو طرف (چپ/راست) ، pair = دو عضله در دو طرف تنه ، mid = یکی در وسط */
const MUS={
quads:{seg:'th',side:1,t:.5,f:.74,r:6.2,o:2,k:'limb'},
hams:{seg:'th',side:-1,t:.5,f:.74,r:5.8,o:2,k:'limb'},
glutes:{seg:'th',side:-1,t:.1,f:.42,r:9,o:3,k:'limb'},
calves:{seg:'sh',side:-1,t:.32,f:.55,r:4.6,o:1.8,k:'limb'},
core:{seg:'tr',side:1,t:.3,f:.5,r:6,o:4.5,k:'mid'},
chest:{seg:'tr',side:1,t:.78,f:.32,r:6.2,o:5.5,k:'pair'},
lats:{seg:'tr',side:-1,t:.58,f:.5,r:6,o:4.5,k:'pair'},
back:{seg:'tr',side:-1,t:.88,f:.28,r:5,o:5,k:'pair'},
lback:{seg:'tr',side:-1,t:.2,f:.32,r:5,o:5.5,k:'mid'},
delts:{seg:'ua',side:1,t:.1,f:.5,r:5.8,o:.5,k:'limb'},
biceps:{seg:'ua',side:1,t:.52,f:.6,r:3.5,o:1.6,k:'limb'},
triceps:{seg:'ua',side:-1,t:.52,f:.6,r:3.5,o:1.6,k:'limb'},
fore:{seg:'fa',side:1,t:.4,f:.7,r:3,o:1.2,k:'limb'}
};
const MUSK=Object.keys(MUS);

const NS='http://www.w3.org/2000/svg';
const L={tr:54,nk:8,th:42,sh:40,ft:16,ua:30,fa:28};
const RD=Math.PI/180;
const CX=160,CY=225;           /* محور دوربین */
function dv(a,l){return [Math.sin(a*RD)*l,Math.cos(a*RD)*l]}
function add(p,v){return [p[0]+v[0],p[1]+v[1]]}
function sm(t){return t*t*(3-2*t)}
function ik(H,T,a,b,sg){
  var dx=T[0]-H[0],dy=T[1]-H[1],d=Math.hypot(dx,dy);
  d=Math.min(Math.max(d,Math.abs(a-b)+.5),a+b-.05);
  var phi=Math.atan2(dx,dy),c=(a*a+d*d-b*b)/(2*a*d);
  var al=Math.acos(Math.max(-1,Math.min(1,c))),A=phi+sg*al;
  return [[H[0]+Math.sin(A)*a,H[1]+Math.cos(A)*a],[H[0]+Math.sin(phi)*d,H[1]+Math.cos(phi)*d]];
}

/* ---------- حل اسکلت در صفحه ساجیتال ---------- */
function solve(p,flip){
  var hip=[p.hx,p.hy];
  var sh=[hip[0]+Math.sin(p.tr*RD)*L.tr,hip[1]-Math.cos(p.tr*RD)*L.tr];
  var ha=(p.tr+p.hd)*RD,hu=[Math.sin(ha),-Math.cos(ha)],hf=[Math.cos(ha),Math.sin(ha)];
  var nk=[sh[0]+hu[0]*L.nk,sh[1]+hu[1]*L.nk];
  var hc=[sh[0]+hu[0]*(L.nk+10),sh[1]+hu[1]*(L.nk+10)];
  var ab=p.ab||0;
  function leg(th,k,pl,ank,ft){
    var K,A;
    if(ank){var r=ik(hip,ank,L.th,L.sh,1);K=r[0];A=r[1];}
    else{K=add(hip,dv(th,L.th*Math.cos(ab*RD)));A=add(K,dv(th-k,L.sh));}
    var s=Math.atan2(A[0]-K[0],A[1]-K[1])/RD;
    var f=(ft!=null)?ft:90+s+pl;
    return {K:K,A:A,T:add(A,dv(f,L.ft))};
  }
  function arm(u,e,h){
    if(h){var r=ik(sh,h,L.ua,L.fa,p.sgA||-1);return {E:r[0],W:r[1]};}
    var E=add(sh,dv(u,L.ua));return {E:E,W:add(E,dv(u+e,L.fa))};
  }
  var ftF=(p.ftF!=null)?p.ftF:p.ftN;
  var N=leg(p.th,p.k,p.pl||0,p.ankN,p.ftN),F;
  if(p.ankF)F=leg(0,0,0,p.ankF,ftF);
  else if(p.thF!=null)F=leg(p.thF,p.kF!=null?p.kF:0,p.plF!=null?p.plF:(p.pl||0),null,ftF);
  else if(p.ankN)F=leg(0,0,0,p.ankN,ftF);
  else F=leg(p.th,p.k,p.pl||0,null,ftF);
  var aN=arm(p.ua,p.e,p.hndN),aF;
  if(p.hndF)aF=arm(0,0,p.hndF);
  else if(p.uaF!=null)aF=arm(p.uaF,p.eF!=null?p.eF:0,null);
  else if(p.hndN)aF=arm(0,0,p.hndN);
  else aF=arm(p.ua,p.e,null);
  var P={hip:hip,sh:sh,nk:nk,hc:hc,nK:N.K,nA:N.A,nT:N.T,fK:F.K,fA:F.A,fT:F.T,nE:aN.E,nW:aN.W,fE:aF.E,fW:aF.W};
  if(flip){for(var k in P){P[k]=[P[k][0],2*hip[1]-P[k][1]]}hf[1]=-hf[1];hu[1]=-hu[1];}
  if(p.anc){
    var ref=p.ancF?P.fA:P.nA,dx=p.anc[0]-ref[0],dy=p.anc[1]-ref[1];
    for(var k2 in P){P[k2]=[P[k2][0]+dx,P[k2][1]+dy]}
  }
  P.hf=hf;P.hu=hu;
  return P;
}

/* ---------- دوربین ---------- */
function camMat(yaw,pit){var t=yaw*RD,f=pit*RD;return {ct:Math.cos(t),st:Math.sin(t),cf:Math.cos(f),sf:Math.sin(f)}}
function mkJ(c){
  var J=function(x,y,z){
    z=z||0;var dx=x-CX,d=z*c.ct-dx*c.st;
    return [CX+dx*c.ct+z*c.st,CY+(y-CY)*c.cf+d*c.sf,d];
  };
  J.st=c.st;J.ct=c.ct;
  return J;
}
function planarMatrix(c,z){
  z=z||0;
  return 'matrix('+[c.ct,-c.st*c.sf,0,c.cf,CX-CX*c.ct+z*c.st,CY-CY*c.cf+CX*c.st*c.sf+z*c.ct*c.sf].map(function(v){return Math.round(v*1000)/1000}).join(' ')+')';
}
function Mv(c,v){return [c.ct*v[0],-c.st*c.sf*v[0]+c.cf*v[1]]}

/* ---------- ابزارهای SVG ---------- */
var n1=function(v){return Math.round(v*10)/10};
function R(x,y,w,h,c,r){return '<rect class="'+c+'" x="'+n1(x)+'" y="'+n1(y)+'" width="'+n1(w)+'" height="'+n1(h)+'" rx="'+(r||0)+'"/>'}
function Ln(a,b,c,w){return '<line class="ln '+c+'" x1="'+n1(a[0])+'" y1="'+n1(a[1])+'" x2="'+n1(b[0])+'" y2="'+n1(b[1])+'" stroke-width="'+(w||4)+'"/>'}
function Ci(p,r,c){return '<circle class="'+c+'" cx="'+n1(p[0])+'" cy="'+n1(p[1])+'" r="'+r+'"/>'}
function poly(pts,c){return '<polygon class="'+c+'" points="'+pts.map(function(p){return n1(p[0])+','+n1(p[1])}).join(' ')+'"/>'}
function Jp(J,pt,z){return J(pt[0],pt[1],z)}
/* جعبه سه‌بعدی: x0<x1 ، y0<y1 (y رو به پایین) ، zh نیم‌عمق */
function box3(J,x0,y0,x1,y1,zh,c){
  var A=J(x0,y0,-zh),B=J(x1,y0,-zh),C=J(x1,y0,zh),D=J(x0,y0,zh),E=J(x0,y1,zh),F=J(x1,y1,zh),G=J(x1,y1,-zh),H=J(x0,y1,-zh);
  var s='';
  if(J.st<=0)s+=poly([B,C,F,G],c)+poly([B,C,F,G],'sd');else s+=poly([A,D,E,H],c)+poly([A,D,E,H],'sd');
  s+=poly([D,C,F,E],c)+poly([A,B,C,D],c)+poly([A,B,C,D],'hl');
  return s;
}
function unit(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [dx/l,dy/l]}
function stack(x,y,w,h){var s=R(x,y,w,h,'mt2',3),i;for(i=0;i<8;i++)s+=R(x+3,y+6+i*(h-14)/8,w-6,(h-14)/8-2,'mt',1);return s}
function cyc(A,B,up,h1,dn,h2,la,lb){return [{p:A,d:up,l:la},{p:B,d:h1,l:lb},{p:B,d:dn,l:lb},{p:A,d:h2,l:la}]}
function chipsHTML(id){
  var ex=EX[id];if(!ex)return '';
  var h='<div class="chips">';
  ex.mus.p.forEach(function(m){h+='<span class="chip p">'+MUSN[m]+'</span>'});
  ex.mus.s.forEach(function(m){h+='<span class="chip s">'+MUSN[m]+'</span>'});
  return h+'</div>';
}

/* ---------- درون‌یابی کلیدها ---------- */
function mix(A,B,t){
  var o={};
  for(var k in A){
    var a=A[k],b=B[k];
    if(typeof a==='number'&&typeof b==='number')o[k]=a+(b-a)*t;
    else if(Array.isArray(a)&&Array.isArray(b))o[k]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    else o[k]=a;
  }
  return o;
}
function poseAt(ex,t){
  var K=ex.keys,n=K.length,acc=0,i=0;
  for(;i<n;i++){if(t<acc+K[i].d)break;acc+=K[i].d}
  if(i>=n){i=n-1;acc-=K[i].d}
  var A=K[i],B=K[(i+1)%n],e=sm(Math.max(0,Math.min(1,(t-acc)/A.d)));
  return {p:mix(A.p,B.p,e),load:A.l+(B.l-A.l)*e};
}

/* ---------- رسم ---------- */
function mkSeg(g,cls){
  var p=document.createElementNS(NS,'path'),a=document.createElementNS(NS,'circle'),b=document.createElementNS(NS,'circle');
  [p,a,b].forEach(function(x){x.setAttribute('class',cls);g.appendChild(x)});
  return {p:p,a:a,b:b};
}
function setSeg(s,A,ra,B,rb){
  ra*=1+A[2]/600;rb*=1+B[2]/600;
  var dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,f=n1;
  s.p.setAttribute('d','M'+f(A[0]+nx*ra)+' '+f(A[1]+ny*ra)+'L'+f(B[0]+nx*rb)+' '+f(B[1]+ny*rb)+'L'+f(B[0]-nx*rb)+' '+f(B[1]-ny*rb)+'L'+f(A[0]-nx*ra)+' '+f(A[1]-ny*ra)+'Z');
  s.a.setAttribute('cx',f(A[0]));s.a.setAttribute('cy',f(A[1]));s.a.setAttribute('r',n1(ra));
  s.b.setAttribute('cx',f(B[0]));s.b.setAttribute('cy',f(B[1]));s.b.setAttribute('r',n1(rb));
}
function mkC(g,cls){var c=document.createElementNS(NS,'circle');c.setAttribute('class',cls);g.appendChild(c);return c}
function setC(c,p,r){c.setAttribute('cx',n1(p[0]));c.setAttribute('cy',n1(p[1]));c.setAttribute('r',n1(r*(1+(p[2]||0)/600)))}

function floorSVG(J){
  var s=poly([J(0,230,-90),J(320,230,-90),J(320,230,90),J(0,230,90)],'flr'),i,f=function(a,b){return '<line class="gl" x1="'+n1(a[0])+'" y1="'+n1(a[1])+'" x2="'+n1(b[0])+'" y2="'+n1(b[1])+'"/>'};
  for(i=-20;i<=340;i+=30)s+=f(J(i,230,-90),J(i,230,90));
  for(i=-90;i<=90;i+=30)s+=f(J(0,230,i),J(320,230,i));
  return s;
}

const Anim={list:[],raf:0,
 mount:function(host,id,o){
  var ex=EX[id];
  if(!ex){host.innerHTML='';return null}
  o=o||{};
  host.innerHTML='<svg viewBox="0 0 320 256" xmlns="'+NS+'" aria-hidden="true"><defs><radialGradient id="bgg" cx=".5" cy=".42" r=".75"><stop offset="0" style="stop-color:var(--card)"/><stop offset="1" style="stop-color:var(--bg)"/></radialGradient></defs>'
    +'<rect width="320" height="256" fill="url(#bgg)"/><g class="gfl"></g><ellipse class="shw" cx="160" cy="230" rx="40" ry="8"/>'
    +'<g class="gp1" opacity=".42"></g><g class="gp2"></g><g class="gb3"></g>'
    +'<g class="gfig" style="filter:drop-shadow(2px 3px 2px rgba(0,0,0,.28))"><g class="gfar"></g><g class="gmf"></g><g class="gbody"></g></g>'
    +'<g class="gmus"></g><g class="gf"></g></svg>';
  var svg=host.firstChild,q=function(c){return svg.querySelector('.'+c)};
  var a={id:id,ex:ex,svg:svg,gfl:q('gfl'),shw:q('shw'),gp1:q('gp1'),gp2:q('gp2'),gb3:q('gb3'),gf:q('gf'),gm:q('gmus'),gmf:q('gmf'),
    tm:0,last:0,speed:o.speed||1,paused:!!o.paused,auto:false,showMus:o.muscles!==false&&S.settings.muscles!==false,
    s1:'',s2:'',s3:'',s4:'',S:{},MI:[],baseYaw:ex.yaw!=null?ex.yaw:28,dirty:true};
  a.setCam=function(yaw,pit){a.yaw=yaw;a.pit=pit;a.cam=camMat(yaw,pit);a.J=mkJ(a.cam);a.dirty=true};
  a.setCam(a.baseYaw,ex.pit!=null?ex.pit:16);
  var gfar=q('gfar'),gb=q('gbody'),s=a.S;
  s.fua=mkSeg(gfar,'skf');s.ffa=mkSeg(gfar,'skf');s.fh=mkC(gfar,'skf');
  s.fth=mkSeg(gfar,'skf');s.fsho=mkSeg(gfar,'sht');s.fsh=mkSeg(gfar,'skf');s.fft=mkSeg(gfar,'skf');
  s.pel=mkSeg(gb,'sht');s.tr=mkSeg(gb,'sk');s.yok=mkSeg(gb,'sk');s.nk=mkSeg(gb,'sk');s.hair=mkC(gb,'hr');s.face=mkC(gb,'sk');s.nose=mkC(gb,'sk');
  s.nth=mkSeg(gb,'sk');s.nsho=mkSeg(gb,'sht');s.nsh=mkSeg(gb,'sk');s.nft=mkSeg(gb,'sk');
  s.nua=mkSeg(gb,'sk');s.nfa=mkSeg(gb,'sk');s.nh=mkC(gb,'sk');
  MUSK.forEach(function(m){
    var d=MUS[m],role=ex.mus.p.indexOf(m)>=0?'p':(ex.mus.s.indexOf(m)>=0?'s':'i'),defs=[];
    if(d.k==='limb'){defs=[['N',a.gm],['F',a.gmf]]}
    else if(d.k==='pair'){defs=[['C+',a.gm],['C-',a.gm]]}
    else defs=[['C0',a.gm]];
    defs.forEach(function(x){
      var e=document.createElementNS(NS,'ellipse');
      e.setAttribute('class','mu '+role);x[1].appendChild(e);
      a.MI.push({m:m,d:d,ch:x[0],e:e,role:role});
    });
  });
  a.gm.style.display=a.showMus?'':'none';a.gmf.style.display=a.showMus?'':'none';
  a.setMus=function(v){a.showMus=v;a.gm.style.display=v?'':'none';a.gmf.style.display=v?'':'none'};

  a.draw=function(t){
   var r=poseAt(ex,t),p=r.p,ld=r.load,c=a.cam,J=a.J;
   if(a.dirty){a.gfl.innerHTML=floorSVG(J);a.dirty=false;a.s1=a.s2=a.s3='\u0000'}
   var P=solve(p,ex.flip),Z=ex.z||{},zh=Z.h||9,zs=Z.s||16,zf=Z.f||11,zw=Z.w||16,ab=p.ab||0;
   var sab=L.th*Math.sin(ab*RD),zk=(zh+zf)/2+sab,za=zf+sab,ze=(zs+zw)/2;
   var j=function(pt,z){return J(pt[0],pt[1],z)};
   var hipC=j(P.hip,0),shC=j(P.sh,0),nkC=j(P.nk,0),hcC=j(P.hc,0);
   var hipN=j(P.hip,zh),hipF=j(P.hip,-zh);
   var kN=j(P.nK,zk),aN=j(P.nA,za),tN=j(P.nT,za),kF=j(P.fK,-zk),aF=j(P.fA,-za),tF=j(P.fT,-za);
   var shN=j(P.sh,zs),shF=j(P.sh,-zs),eN=j(P.nE,ze),eF=j(P.fE,-ze),wN=j(P.nW,zw),wF=j(P.fW,-zw);
   var rs=Math.hypot(11*c.ct,15*c.st),rh=Math.hypot(10*c.ct,10*c.st);
   var s=a.S;
   /* دورِ دور */
   setSeg(s.fua,shF,5.2,eF,4.4);setSeg(s.ffa,eF,4.4,wF,3.6);setC(s.fh,wF,3.8);
   var mid=function(A,B,f){return [A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f,A[2]+(B[2]-A[2])*f]};
   setSeg(s.fth,hipF,9.2,kF,7);setSeg(s.fsho,hipF,9,mid(hipF,kF,.42),7.8);
   setSeg(s.fsh,kF,6.6,aF,4.6);setSeg(s.fft,aF,4.4,tF,3.4);
   /* تنه */
   setSeg(s.pel,hipF,7.5,hipN,7.5);
   setSeg(s.tr,hipC,rh,shC,rs);
   setSeg(s.yok,shF,6,shN,6);
   setSeg(s.nk,shC,4.4,nkC,4);
   var hv=Mv(c,P.hf),uv=Mv(c,P.hu);
   setC(s.hair,[hcC[0]-hv[0]*2.6+uv[0]*1.2,hcC[1]-hv[1]*2.6+uv[1]*1.2,hcC[2]],12.2);
   setC(s.face,[hcC[0]+hv[0]*1.3,hcC[1]+hv[1]*1.3,hcC[2]],10.8);
   setC(s.nose,[hcC[0]+hv[0]*11.6-uv[0],hcC[1]+hv[1]*11.6-uv[1],hcC[2]],2.2);
   /* نزدیک */
   setSeg(s.nth,hipN,9.5,kN,7.2);setSeg(s.nsho,hipN,9.6,mid(hipN,kN,.42),8.1);
   setSeg(s.nsh,kN,6.8,aN,4.8);setSeg(s.nft,aN,4.6,tN,3.6);
   setSeg(s.nua,shN,5.8,eN,4.7);setSeg(s.nfa,eN,4.7,wN,3.7);setC(s.nh,wN,4);
   /* سایه کف */
   var low=Math.max(P.nT[1],P.fT[1],P.nA[1],P.hip[1]+8),cs=j([(P.nA[0]+P.fA[0]+P.hip[0])/3,230],0);
   a.shw.setAttribute('cx',n1(cs[0]));a.shw.setAttribute('cy',n1(cs[1]));
   a.shw.setAttribute('rx',n1(48));a.shw.setAttribute('ry',n1(48*c.sf+2));
   a.shw.style.opacity=(.28*Math.max(.12,Math.min(1,1-(230-low)/90))).toFixed(2);
   /* عضلات */
   if(a.showMus){
    var mt=Mv;
    a.MI.forEach(function(mi){
     var d=mi.d,ch=mi.ch,A,B,sg,z;
     if(d.seg==='tr'){A=P.hip;B=P.sh;sg=-1;z=ch==='C+'?7:(ch==='C-'?-7:0)}
     else{
       var pre=ch==='F'?'f':'n',zz=ch==='F'?-1:1;
       if(d.seg==='th'){A=P.hip;B=P[pre+'K'];z=zz*(zh+(zk-zh)*d.t)}
       else if(d.seg==='sh'){A=P[pre+'K'];B=P[pre+'A'];z=zz*(zk+(za-zk)*d.t)}
       else if(d.seg==='ua'){A=P.sh;B=P[pre+'E'];z=zz*(zs+(ze-zs)*d.t)}
       else{A=P[pre+'E'];B=P[pre+'W'];z=zz*(ze+(zw-ze)*d.t)}
       sg=1;
     }
     var dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,sgn=sg*d.side*(ex.flip?-1:1);
     var cx=A[0]+dx*d.t+uy*sgn*d.o,cy=A[1]+dy*d.t-ux*sgn*d.o,ang=Math.atan2(dy,dx),ca=Math.cos(ang),sa=Math.sin(ang);
     var pc=J(cx,cy,z);
     var m1=[c.ct*ca,-c.st*c.sf*ca+c.cf*sa],m2=[-c.ct*sa,c.st*c.sf*sa+c.cf*ca];
     mi.e.setAttribute('transform','matrix('+[m1[0],m1[1],m2[0],m2[1],pc[0],pc[1]].map(function(v){return Math.round(v*1000)/1000}).join(' ')+')');
     mi.e.setAttribute('rx',n1(len*d.f/2));mi.e.setAttribute('ry',d.r);
     if(mi.role==='p')mi.e.style.opacity=(.3+.65*ld).toFixed(2);
     else if(mi.role==='s')mi.e.style.opacity=(.18+.42*ld).toFixed(2);
    });
   }
   /* تجهیزات */
   var pl=ex.pl?ex.pl(P,p):'';
   if(pl!==a.s1){a.gp1.innerHTML=pl;a.gp2.innerHTML=pl;a.s1=pl}
   var m0=planarMatrix(c,0),mf=planarMatrix(c,-26);
   a.gp2.setAttribute('transform',m0);a.gp1.setAttribute('transform',mf);
   var sb=ex.rb3?ex.rb3(P,p,J):'';if(sb!==a.s3){a.gb3.innerHTML=sb;a.s3=sb}
   var sf=ex.rf?ex.rf(P,p,J):'';if(sf!==a.s4){a.gf.innerHTML=sf;a.s4=sf}
  };
  a.step=function(now){
   var dt=a.last?Math.min(now-a.last,80):0;a.last=now;
   if(!a.paused)a.tm+=dt*a.speed;
   if(a.auto)a.setCam(a.baseYaw+36*Math.sin(now/2100),a.pit);
   a.draw(a.tm%ex.total);
  };
  if(o.orbit){
   var dragX=null;
   host.classList.add('orbit');
   host.addEventListener('pointerdown',function(e){dragX=e.clientX;try{host.setPointerCapture(e.pointerId)}catch(x){}});
   host.addEventListener('pointermove',function(e){
     if(dragX==null)return;var dx=e.clientX-dragX;dragX=e.clientX;a.auto=false;
     a.baseYaw=Math.max(-62,Math.min(62,a.yaw+dx*.45));a.setCam(a.baseYaw,a.pit);
   });
   var up=function(){dragX=null};
   host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  }
  a.draw(0);
  Anim.list.push(a);
  if(!Anim.raf)Anim.raf=requestAnimationFrame(Anim.tick);
  return a;
 },
 tick:function(now){
  Anim.raf=0;
  Anim.list=Anim.list.filter(function(a){return a.svg.isConnected});
  Anim.list.forEach(function(a){a.step(now)});
  if(Anim.list.length)Anim.raf=requestAnimationFrame(Anim.tick);
 }
};
