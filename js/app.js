'use strict';
/* app.js — رابط کاربری، جلسه تمرین، چیدمان و تنظیمات */
/* ================= MODAL ================= */
function closeModal(){var m=$('#modal');m.classList.remove('on');m.innerHTML='';if(pickBack){pickBack=false;openPicker(true)}}
function openAnim(id){
  var e=E[id];if(!e)return;
  var g=GUIDE[id],m=$('#modal'),gh='';
  if(g){
    gh+='<div class="guide"><h4>🖥 دستگاه</h4><p>'+g.device+'</p><h4>⚙️ تنظیم قبل از شروع</h4><ul>';
    g.setup.forEach(function(t){gh+='<li>'+t+'</li>'});
    gh+='</ul><h4>🎯 مراحل انجام</h4>';
    g.steps.forEach(function(t,i){gh+='<div class="step"><div class="num">'+fa(i+1)+'</div><div>'+t+'</div></div>'});
    gh+='<h4>⚠️ هشدارها</h4><ul>';
    g.warn.forEach(function(t){gh+='<li>'+t+'</li>'});
    gh+='</ul></div>';
  }
  m.innerHTML='<div class="box"><button class="close" id="mclose">✕</button><h3>'+e[0]+'</h3><p class="en">'+e[1]+'</p>'
    +'<div class="anim" id="animBox"></div>'
    +'<p class="mut" style="font-size:12px;margin:0">با کشیدن انگشت روی تصویر، دوربین را بچرخان</p>'
    +'<div class="animctl"><button id="pauseBtn">⏸ توقف</button><button id="speedBtn">سرعت ۱×</button><button id="musBtn" class="on">🫀 عضلات</button></div>'
    +'<div class="animctl"><button data-cam="0">جانبی</button><button data-cam="1" class="on">سه‌چهارم</button><button data-cam="2">روبه‌رو</button><button id="autoBtn">🔄 چرخش</button></div>'
    +'<p class="mut" style="font-size:12px;margin:2px 0">🔴 عضله اصلی · 🟠 عضله کمکی</p>'+chipsHTML(id)
    +'<p class="tip" style="text-align:right;font-size:13px;margin-top:6px">'+e[3]+'</p>'+gh+'</div>';
  m.classList.add('on');
  var inst=Anim.mount($('#animBox'),id,{speed:1,orbit:true});
  var speeds=[1,.5,1.5],si=0,base=inst?inst.baseYaw:28;
  $('#mclose').onclick=closeModal;
  $('#pauseBtn').onclick=function(){if(!inst)return;inst.paused=!inst.paused;this.textContent=inst.paused?'▶ ادامه':'⏸ توقف'};
  $('#speedBtn').onclick=function(){if(!inst)return;si=(si+1)%speeds.length;inst.speed=speeds[si];this.textContent='سرعت '+fa(speeds[si])+'×'};
  $('#musBtn').onclick=function(){if(!inst)return;inst.setMus(!inst.showMus);this.classList.toggle('on',inst.showMus)};
  $('#autoBtn').onclick=function(){if(!inst)return;inst.auto=!inst.auto;if(!inst.auto)inst.baseYaw=inst.yaw;this.classList.toggle('on',inst.auto)};
  var cams=[6,base,58];
  Array.prototype.forEach.call(m.querySelectorAll('[data-cam]'),function(b){
    b.onclick=function(){
      if(!inst)return;inst.auto=false;$('#autoBtn').classList.remove('on');
      var y=cams[+b.dataset.cam];inst.baseYaw=y;inst.setCam(y,inst.pit);
      Array.prototype.forEach.call(m.querySelectorAll('[data-cam]'),function(x){x.classList.toggle('on',x===b)});
    };
  });
}
function openList(){
  var m=$('#modal'),h='<div class="box"><button class="close" id="mclose">✕</button><h3>لیست جلسه</h3><p class="mut" style="font-size:13px">روی هر مورد بزن تا مستقیم بروی آن.</p><ul class="lst">';
  R_.steps.forEach(function(st,i){
    var nm=st.k==='n'?st.t:E[st.id][0]+' · '+setsText(st);
    h+='<li class="'+(i===R_.i?'cur':(i<R_.i?'dn':''))+'"><button data-a="jump" data-n="'+i+'">'+fa(i+1)+'. '+nm+'</button></li>';
  });
  m.innerHTML=h+'</ul></div>';
  m.classList.add('on');
  $('#mclose').onclick=closeModal;
}
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')closeModal()});

/* ================= SESSION ================= */
let R_=null;      /* جلسه فعال */
let tab='home';
let PLN=null;     /* جلسه در حال آماده‌سازی */

function suggestWeight(id){
  var hist=S.log[id];
  if(!hist||!hist.length)return '';
  return hist[hist.length-1].weight||'';
}
function recordPR(id,weight,reps){
  if(!weight)return false;
  var hist=S.log[id]||(S.log[id]=[]),best={weight:0,reps:0};
  for(var i=0;i<hist.length;i++){var x=hist[i];if(x.weight>best.weight||(x.weight===best.weight&&x.reps>best.reps))best=x;}
  var isPR=weight>best.weight||(weight===best.weight&&reps>best.reps);
  hist.push({weight:weight,reps:reps,at:Date.now()});
  if(hist.length>30)hist.shift();
  return isPR;
}
let tId=null;
function toast(msg){var t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('on');clearTimeout(tId);tId=setTimeout(function(){t.classList.remove('on')},1800)}

function startSession(n,atId){
  initAudio();
  n=+n;
  if(atId&&getSkip(n).indexOf(atId)>=0)S.skip[String(n)]=getSkip(n).filter(function(x){return x!==atId});
  var skip=getSkip(n),ids=getOrder(n).filter(function(x){return skip.indexOf(x)<0});
  if(!ids.length){toast('حداقل یک حرکت باید فعال باشد');return}
  var i=0;
  if(atId&&ids.indexOf(atId)>=0)i=2+ids.indexOf(atId);
  R_={kind:'p',n:n,ids:ids,steps:build(n,ids),i:i,s:0,ph:'work',end:0,sessionStart:Date.now(),tonnage:0,prs:[],sets:[],notes:[],restSec:0};
  lock();go();
}
function startCustom(c){
  initAudio();
  if(!c.items.length){toast('حداقل یک حرکت لازم است');return}
  R_={kind:'c',n:0,name:c.name,cust:c,ids:c.items.map(function(x){return x.id}),steps:custSteps(c),i:0,s:0,ph:'work',end:0,sessionStart:Date.now(),tonnage:0,prs:[],sets:[],notes:[],restSec:0};
  lock();go();
}
function sessLabel(){
  if(R_.kind==='c')return 'سفارشی · '+R_.name;
  return 'جلسه '+fa(R_.n)+' · هفته '+fa(Math.floor((R_.n-1)/3)+1);
}

const A={
  plan:function(n){PLN={n:+n};tab='plan';render();},
  start:function(n){startSession(n||(PLN&&PLN.n))},
  startAt:function(id){startSession(PLN.n,id)},
  resume:function(){
    initAudio();var c=S.cur,ids=c.ids||defOrder(c.n),isC=c.kind==='c',steps=isC?custSteps(c.cust):build(c.n,ids);
    R_={kind:isC?'c':'p',n:c.n,name:c.name,cust:c.cust,ids:ids,steps:steps,i:c.i,s:c.s,ph:'work',end:0,sessionStart:c.startedAt||Date.now(),tonnage:c.tonnage||0,prs:c.prs||[],sets:c.sets||[],notes:c.notes||[],restSec:c.restSec||0};
    lock();go();
  },
  home:function(){R_=null;tab='home';render();},
  next:function(){var st=R_.steps[R_.i];if(st&&st.k==='n'&&st.m)R_.notes.push(st.m);R_.i++;R_.s=0;go();},
  done:function(){doneSet();},
  hold:function(){var st=R_.steps[R_.i],tot=st.u==='t'?st.reps*60:st.reps;R_.ph='hold';R_.lt=0;R_.holdTotal=tot;R_.end=Date.now()+tot*1000;render();},
  holdEnd:function(){var left=Math.max(0,Math.ceil((R_.end-Date.now())/1000)),secs=R_.holdTotal-left;R_.end=0;doneSet(secs);},
  rplus:function(){var i=$('#r');if(!i)return;i.value=(+en(i.value)||0)+1;click();},
  rminus:function(){var i=$('#r');if(!i)return;i.value=Math.max(0,(+en(i.value)||0)-1);click();},
  setBW:function(v){v=+en(v);if(!(v>=20&&v<=400)){toast('وزن معتبر وارد کن');render();return}S.settings.bw=fromDisp(v);save();render();toast('وزن ذخیره شد');},
  skip:function(){endRest();},
  add:function(){R_.end+=15000;render();},
  showAnim:function(id){openAnim(id);},
  list:function(){openList();},
  jump:function(i){closeModal();R_.restStart=0;R_.i=+i;R_.s=0;R_.ph='work';R_.end=0;go();},
  mv:function(i,d){
    var n=PLN.n,o=getOrder(n),a=+i,b=a+(+d);
    if(b<0||b>=o.length)return;
    var t=o[a];o[a]=o[b];o[b]=t;S.order[String(n)]=o;save();render();
  },
  sk:function(id){
    var n=String(PLN.n),s=getSkip(PLN.n).slice(),i=s.indexOf(id);
    if(i>=0)s.splice(i,1);else s.push(id);
    S.skip[n]=s;save();render();
  },
  ordDef:function(){S.order[String(PLN.n)]=defOrder(PLN.n);save();render();toast('چیدمان پیشنهادی: بدون دستگاه اول');},
  ordOrig:function(){S.order[String(PLN.n)]=origOrder(PLN.n);save();render();toast('ترتیب اصلی برنامه');},
  finish:function(){
    if(R_.kind!=='c'&&S.done.indexOf(R_.n)<0)S.done.push(R_.n);
    var dur=Math.round((Date.now()-R_.sessionStart)/1000),kc=Math.round(calcSession(R_).total);
    S.history.unshift({kind:R_.kind,n:R_.n,name:R_.name,at:Date.now(),dur:dur,tonnage:R_.tonnage,prs:R_.prs.slice(),kcal:kc,sets:R_.sets.length});
    S.history=S.history.slice(0,100);
    S.cur=null;save();unlock();
    toast(R_.prs.length?'🏆 رکورد جدید در '+fa(R_.prs.length)+' حرکت':'🔥 '+fa(kc)+' کیلوکالری ثبت شد');
    R_=null;tab='home';render();
  },
  reset:function(){if(confirm('همه پیشرفت، تاریخچه و وزنه‌های ذخیره‌شده پاک شود؟')){S=clone(DEF);save();render();}},
  setTheme:function(v){S.settings.theme=v;save();render();},
  setUnit:function(v){S.settings.unit=v;save();render();},
  toggle:function(k,val){S.settings[k]=val;save();},
  minus:function(){var i=$('#w');if(!i)return;i.value=Math.max(0,(+en(i.value)||0)-2.5);click();},
  plus:function(){var i=$('#w');if(!i)return;i.value=(+en(i.value)||0)+2.5;click();},
  export:function(){
    var blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wk-backup-'+Date.now()+'.json';a.click();
    toast('فایل پشتیبان ساخته شد');
  },
  import:function(){var i=$('#imp');if(i){i.value='';i.click();}},
  doImport:function(file){var r=new FileReader();r.onload=function(){try{S=Object.assign(clone(DEF),JSON.parse(r.result));fix();save();render();toast('وارد شد');}catch(e){toast('فایل معتبر نیست');}};r.readAsText(file);},
  tab:function(t){tab=t;render();window.scrollTo(0,0);}
};

document.addEventListener('click',function(e){
  var b=e.target.closest('[data-a]');if(!b)return;
  var a=b.dataset.a;
  if(a==='import'){A.import();return;}
  initAudio();
  if(A[a])A[a](b.dataset.n,b.dataset.k);
});
document.addEventListener('change',function(e){
  if(e.target.id==='imp'&&e.target.files&&e.target.files[0])A.doImport(e.target.files[0]);
  if(e.target.dataset&&e.target.dataset.a==='set')A.toggle(e.target.dataset.k,e.target.checked);
  if(e.target.id==='bws'||e.target.id==='bwf')A.setBW(e.target.value);
});

function go(){S.cur={kind:R_.kind,n:R_.n,name:R_.name,cust:R_.cust,i:R_.i,s:R_.s,startedAt:R_.sessionStart,ids:R_.ids,sets:R_.sets,notes:R_.notes,restSec:R_.restSec,tonnage:R_.tonnage,prs:R_.prs};save();render();}

function doneSet(secs){
  var st=R_.steps[R_.i],w=$('#w'),ri=$('#r'),weight=0,hold=(st.u==='s'||st.u==='t');
  if(w&&w.value){weight=fromDisp(+en(w.value));S.w[st.id]=w.value;}
  var reps=st.reps;
  if(ri&&ri.value!=='')reps=Math.max(0,+en(ri.value)||0);
  var rec={id:st.id,reps:reps,u:st.u,w:weight};
  if(hold)rec.secs=Math.max(1,Math.round(secs||(st.u==='t'?st.reps*60:st.reps)));
  R_.sets.push(rec);
  var isPR=recordPR(st.id,weight,reps);
  if(isPR)R_.prs.push({id:st.id,weight:weight,reps:reps});
  if(weight)R_.tonnage+=weight*reps;
  var ni=R_.i,ns=R_.s+1;if(ns>=st.n){ni++;ns=0;}
  var nx=R_.steps[ni];R_.nx={i:ni,s:ns};
  if(!nx||nx.k==='n'||!(st.rest>0)){R_.i=ni;R_.s=ns;R_.ph='work';R_.end=0;go();return;}
  R_.restStart=Date.now();R_.ph='rest';R_.lt=0;R_.end=Date.now()+st.rest*1000;save();render();
}
function endRest(){if(R_.restStart){R_.restSec+=Math.min((Date.now()-R_.restStart)/1000,900);R_.restStart=0}R_.i=R_.nx.i;R_.s=R_.nx.s;R_.ph='work';R_.end=0;go();}

setInterval(function(){
  if(!R_||!R_.end)return;
  var l=Math.ceil((R_.end-Date.now())/1000),t=$('#t');
  if(t)t.textContent=R_.ph==='hold'?fmtTime(Math.max(l,0)):fa(Math.max(l,0));
  var ring=$('#ring');
  if(ring){var total=ring.dataset.total|0,len=ring.dataset.len|0;ring.style.strokeDashoffset=len*(1-Math.max(0,l)/Math.max(total,1));}
  if(l<=3&&l>0&&R_.lt!==l){R_.lt=l;beep(660,.12);}
  if(l<=0){R_.end=0;ding();if(R_.ph==='hold'){doneSet(R_.holdTotal);}else{endRest();}}
},250);

function topBar(label){
  var kc=calcSession(R_).total;
  var pct=Math.round(100*Math.min(R_.i,R_.steps.length)/R_.steps.length);
  return '<div class="top"><button class="ghost" data-a="home">خانه</button><span class="mut">'+label+(kc>=1?' · 🔥 '+fa(Math.round(kc)):'')+'</span><button class="ghost" data-a="list">☰ لیست</button></div><div class="bar"><i style="width:'+pct+'%"></i></div>';
}
function ringHTML(left,total){
  var len=2*Math.PI*70,off=len*(1-left/Math.max(total,1));
  return '<div class="ring"><svg width="170" height="170" viewBox="0 0 180 180"><circle class="bgc" cx="90" cy="90" r="70"/><circle id="ring" class="fgc" cx="90" cy="90" r="70" stroke-dasharray="'+len+'" stroke-dashoffset="'+off+'" data-total="'+total+'" data-len="'+len+'"/></svg></div>';
}
function miniHTML(id){
  if(S.settings.mini===false||!EX[id])return '';
  return '<div class="anim mini" id="mini" data-a="showAnim" data-n="'+id+'"></div>'+chipsHTML(id);
}
function mountMini(id){var h=$('#mini');if(h)Anim.mount(h,id,{speed:1});}

function render(){
  var a=$('#app');applyTheme();
  document.body.dataset.m=R_?R_.ph:'home';
  if(!R_){homeView(a);return;}
  var lab=sessLabel();
  if(R_.i>=R_.steps.length){
    a.innerHTML=topBar(lab)+finishHTML();
    return;
  }
  var st=R_.steps[R_.i];
  if(st.k==='n'){
    var body=Array.isArray(st.x)?'<ul class="chk">'+st.x.map(function(i){return '<li><label><input type="checkbox">'+i+'</label></li>'}).join('')+'</ul>':'<p>'+st.x+'</p>';
    a.innerHTML=topBar(lab)+'<section class="card"><h2>'+st.t+'</h2>'+body+'</section><button class="primary" data-a="next">تمام شد</button>';
    return;
  }
  var e=E[st.id],u={s:'ثانیه',m:'متر',e:'تکرار برای هر طرف',t:'دقیقه','':'تکرار'}[st.u];
  if(R_.ph==='rest'||R_.ph==='hold'){
    var left=Math.max(0,Math.ceil((R_.end-Date.now())/1000)),total=R_.ph==='hold'?R_.holdTotal:st.rest;
    if(R_.ph==='hold'){
      a.innerHTML=topBar(lab)+'<div class="rest"><p>'+e[0]+(st.u==='t'?'، ادامه بده':'، نگه دار')+'</p>'+ringHTML(left,total)+'<div class="big sm" id="t">'+fmtTime(left)+'</div><p>مانده</p><button class="sec" style="width:100%" data-a="holdEnd">تمام شد (زودتر)</button></div>';
      return;
    }
    var nx=R_.steps[R_.nx.i],nl=E[nx.id][0]+' · ست '+fa(R_.nx.s+1)+' از '+fa(nx.n);
    a.innerHTML=topBar(lab)+'<div class="rest"><p>استراحت</p>'+ringHTML(left,total)+'<div class="big" id="t">'+fa(left)+'</div><p>ثانیه</p><p>بعدی: '+nl+'</p>'+miniHTML(nx.id)+'<div class="row"><button class="sec" data-a="add">+۱۵ ثانیه</button><button class="sec" data-a="skip">رد کردن</button></div></div>';
    mountMini(nx.id);
    return;
  }
  var kg=/کیلو/.test(e[2]),hint=e[2].replace(/[^۰-۹ تا]/g,'').trim(),sugg=suggestWeight(st.id);
  var dispW=S.settings.unit==='lb'&&sugg?Math.round(+sugg*KG_TO_LB*2)/2:sugg;
  var unitLabel=S.settings.unit==='lb'?'پوند':'کیلو';
  var html=topBar(lab)+'<section class="card"><h2>'+e[0]+'</h2><p class="en">'+e[1]+'</p>'
    +miniHTML(st.id)
    +'<div class="setno">ست '+fa(R_.s+1)+' از '+fa(st.n)+'</div>'
    +'<div class="big">'+fa(st.reps)+'</div><div class="unit">'+u+'</div>'
    +(st.fx?'<p class="ex">'+st.fx+'</p>':'')
    +'<div style="text-align:center"><button class="showex" data-a="showAnim" data-n="'+st.id+'">🎬 راهنمای کامل حرکت و دستگاه</button></div>';
  if(st.u!=='s'&&st.u!=='t')html+='<div class="w"><span>'+(st.u==='m'?'متر انجام‌شده':'تکرار انجام‌شده')+'</span><div class="stepper"><button data-a="rplus">+</button><input id="r" type="number" inputmode="numeric" value="'+st.reps+'"><button data-a="rminus">−</button></div></div>';
  if(kg){
    html+='<div class="w"><span>'+(st.id==='ap'?'کمک':'وزنه')+' ('+unitLabel+')</span><div class="stepper"><button data-a="plus">+</button><input id="w" type="number" inputmode="decimal" step="0.5" value="'+dispW+'" placeholder="'+hint+'"><button data-a="minus">−</button></div></div>';
    if(sugg)html+='<p class="ex" style="margin-top:6px">پیشنهاد از جلسه قبل: '+fa(toDisp(+sugg))+' '+unitLabel+'</p>';
  } else html+='<p class="ex">'+e[2]+'</p>';
  html+='<p class="tip">'+e[3]+'</p></section><button class="primary" data-a="'+((st.u==='s'||st.u==='t')?'hold':'done')+'">'+(st.u==='s'?'شروع '+fa(st.reps)+' ثانیه':st.u==='t'?'شروع '+fa(st.reps)+' دقیقه':'ست تمام شد')+'</button>';
  a.innerHTML=html;
  mountMini(st.id);
}

function finishHTML(){
  var r=calcSession(R_),p=r.parts,u=S.settings.unit==='lb'?'پوند':'کیلو',dur=Math.round((Date.now()-R_.sessionStart)/1000);
  var rows=[['ورزش‌های وزنه‌ای و تمرینی',p.sets],['هوازی',p.cardio],['گرم کردن و سرد کردن',p.warm],['استراحت بین ست‌ها',p.rest]].filter(function(x){return x[1]>=1});
  var top=Object.keys(r.per).map(function(k){return [k,r.per[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,3);
  var h='<section class="card"><h2>جلسه تمام شد 🎉</h2><div class="kc"><div class="kbig">🔥 '+fa(Math.round(r.total))+'</div><div>کیلوکالری سوخته (تخمین)</div></div>';
  h+='<ul class="krows">'+rows.map(function(x){return '<li><span>'+x[0]+'</span><b>'+fa(Math.round(x[1]))+'</b></li>'}).join('')+'</ul>';
  if(top.length&&top[0][1]>=1)h+='<h3 style="margin:14px 0 4px">بیشترین سوخت</h3><ul class="krows">'+top.map(function(x){return '<li><span>'+E[x[0]][0]+'</span><b>'+fa(Math.round(x[1]))+'</b></li>'}).join('')+'</ul>';
  h+='<div class="stat" style="grid-template-columns:repeat(3,1fr)"><div class="box"><b>'+fmtTime(dur)+'</b><small>مدت</small></div><div class="box"><b>'+fa(R_.sets.length)+'</b><small>ست انجام‌شده</small></div><div class="box"><b>'+fa(Math.round(toDisp(R_.tonnage)))+'</b><small>حجم وزنه ('+u+')</small></div></div>';
  h+='<div class="w"><span>وزن بدن ('+u+')</span><input id="bwf" type="number" inputmode="decimal" step="0.5" value="'+toDisp(bodyKg())+'"></div>';
  h+='<p class="tip">عدد بالا با روش MET تخمین زده شده: مدت واقعی هر ست، وزنه‌ای که وارد کردی، وزن بدنت و استراحت‌ها. خطای معمول حدود ±۲۵٪ است و کل سوخت (شامل متابولیسم پایه در این مدت) را نشان می‌دهد. با تغییر وزن، عدد دوباره حساب می‌شود.</p></section><button class="primary" data-a="finish">ثبت جلسه</button>';
  return h;
}

function planView(a){
  var n=PLN.n,w=Math.floor((n-1)/3),P=PL['ABC'[(n-1)%3]],ord=getOrder(n),skip=getSkip(n),map={};
  exItems(n).forEach(function(x){map[x.id]=x});
  var h='<div class="top"><button class="ghost" data-a="tab" data-n="home">→ برگشت</button><span class="mut">آماده‌سازی جلسه</span><span></span></div>';
  h+='<h1>جلسه '+fa(n)+' · هفته '+fa(w+1)+'</h1><p class="mut">'+P.name+'</p>';
  h+='<div class="fixed">ثابت در ابتدا: گرم کردن و بلوک اصلاحی. ورزش‌ها را همان‌طور که می‌خواهی بچین؛ هر حرکت را می‌توانی حذف کنی یا از همان‌جا شروع کنی.</div>';
  var est=estimateSteps(build(n,ord.filter(function(x){return skip.indexOf(x)<0})));
  h+='<div class="fixed">⏱ حدود <b>'+fa(est.mins)+'</b> دقیقه · 🔥 حدود <b>'+fa(Math.round(est.total))+'</b> کیلوکالری (تخمین با وزن '+fa(Math.round(toDisp(bodyKg())))+' '+(S.settings.unit==='lb'?'پوند':'کیلو')+')</div>';
  h+='<div class="row" style="margin-top:6px"><button class="sec" data-a="ordDef">⚡ پیشنهادی (بدون دستگاه اول)</button><button class="sec" data-a="ordOrig">ترتیب اصلی</button></div>';
  h+='<ul class="plan">';
  ord.forEach(function(id,i){
    var it=map[id],sk=skip.indexOf(id)>=0;
    h+='<li class="pi'+(sk?' skp':'')+'"><div class="pn">'+fa(i+1)+'</div><div class="pt"><b>'+E[id][0]+'</b><small>'+setsText(it)+' <span class="badge m'+MACH[id]+'">'+MLAB[MACH[id]]+'</span></small></div>'
      +'<div class="pa"><button data-a="mv" data-n="'+i+'" data-k="-1" aria-label="بالا">▲</button><button data-a="mv" data-n="'+i+'" data-k="1" aria-label="پایین">▼</button><button data-a="showAnim" data-n="'+id+'" aria-label="نمایش">🎬</button><button data-a="sk" data-n="'+id+'" aria-label="حذف">'+(sk?'↺':'✕')+'</button></div>'
      +'<button class="here" data-a="startAt" data-n="'+id+'">▶ از همین حرکت شروع کن</button></li>';
  });
  h+='</ul><div class="fixed">ثابت در انتها: '+P.ct+' و سرد کردن.</div>';
  h+='<button class="primary" data-a="start" data-n="'+n+'">شروع جلسه</button>';
  a.innerHTML=h;
}

function homeView(a){
  if(tab==='cedit'){ceditView(a);return;}
  if(tab==='plan'&&PLN){planView(a);return;}
  if(tab==='plan')tab='home';
  var total=12,done=S.done.length,nxt=null;
  for(var i=1;i<=total;i++){if(S.done.indexOf(i)<0){nxt=i;break;}}
  var h='<h1>برنامه تمرین ۴ هفته‌ای</h1><p class="mut">'+fa(done)+' از '+fa(total)+' جلسه انجام شده · '+fa(Math.round(done/total*100))+'٪</p>';
  h+='<div class="tabs"><button class="'+(tab==='home'?'on':'')+'" data-a="tab" data-n="home">برنامه</button><button class="'+(tab==='cust'?'on':'')+'" data-a="tab" data-n="cust">سفارشی</button><button class="'+(tab==='hist'?'on':'')+'" data-a="tab" data-n="hist">تاریخچه</button><button class="'+(tab==='set'?'on':'')+'" data-a="tab" data-n="set">تنظیمات</button></div>';
  if((tab==='home'||tab==='cust')&&!S.settings.bw)h+='<div class="fixed">⚖️ وزن بدنت را وارد نکرده‌ای؛ کالری فعلاً با ۷۰ کیلو تخمین زده می‌شود. <button class="ghost" data-a="tab" data-n="set">وارد کردن وزن</button></div>';
  if(tab==='cust'){
    if(S.cur)h+='<button class="primary" data-a="resume">ادامه: '+(S.cur.kind==='c'?S.cur.name:'جلسه '+fa(S.cur.n))+'</button>';
  } else if(tab==='home'){
    if(S.cur)h+='<button class="primary" data-a="resume">ادامه '+(S.cur.kind==='c'?S.cur.name:'جلسه '+fa(S.cur.n))+'</button>';
    for(var w=0;w<4;w++){
      h+='<h3>هفته '+fa(w+1)+'</h3><div class="grid">';
      for(var k=1;k<=3;k++){var n=w*3+k;
        h+='<button class="tile'+(S.done.indexOf(n)>=0?' d':'')+(n===nxt?' nx':'')+'" data-a="plan" data-n="'+n+'">جلسه '+fa(n)+'<small>'+PL['ABC'[k-1]].name+'</small></button>';
      }
      h+='</div>';
    }
    h+='<p class="mut" style="margin-top:24px;font-size:14px">روی هر جلسه بزن تا قبل از شروع، ترتیب حرکت‌ها را بچینی. دوشنبه و چهارشنبه و شنبه یا هر سه روز با فاصله. وزنه‌ها را در هر ست وارد کن؛ جلسه بعد همان عدد نمایش داده می‌شود.</p>';
  } else if(tab==='hist'){
    var H=S.history||[],totalT=0,totalK=0;
    for(var j=0;j<H.length;j++){totalT+=H[j].tonnage||0;totalK+=H[j].kcal||0;}
    h+='<div class="stat" style="grid-template-columns:repeat(3,1fr)"><div class="box"><b>'+fa(H.length)+'</b><small>جلسه ثبت‌شده</small></div><div class="box"><b>'+fa(Math.round(totalK))+'</b><small>کیلوکالری کل</small></div><div class="box"><b>'+fa(Math.round(toDisp(totalT)))+'</b><small>حجم وزنه ('+(S.settings.unit==='lb'?'پوند':'کیلو')+')</small></div></div>';
    if(H.length){
      var recent=H.slice(0,8).reverse(),max=1;
      for(var r=0;r<recent.length;r++){if((recent[r].kcal||0)>max)max=recent[r].kcal||0;}
      h+='<div class="spark">';
      for(var r2=0;r2<recent.length;r2++){var x=recent[r2];h+='<i style="height:'+Math.max(4,((x.kcal||0)/max)*60)+'px"></i>';}
      h+='</div><p class="mut" style="font-size:12px;margin:4px 0">کالری هر جلسه (۸ جلسه اخیر)</p><h3>جلسات اخیر</h3><ul class="hist">';
      for(var q=0;q<H.length;q++){var y=H[q];
        h+='<li><div><b>'+(y.name||('جلسه '+fa(y.n)))+'</b><small>'+fmtDate(y.at)+' · '+fmtTime(y.dur||0)+(y.prs&&y.prs.length?' · 🏆 '+fa(y.prs.length):'')+'</small></div><div class="mut">'+(y.kcal?'🔥 '+fa(y.kcal):fa(Math.round(y.tonnage||0))+' کیلو')+'</div></li>';
      }
      h+='</ul>';
    } else h+='<p class="mut">هنوز جلسه‌ای ثبت نشده.</p>';
  } else {
    h+='<section class="card">';
    h+='<div class="sw"><span>تم</span><select id="thm"><option value="auto"'+(S.settings.theme==='auto'?' selected':'')+'>خودکار</option><option value="light"'+(S.settings.theme==='light'?' selected':'')+'>روشن</option><option value="dark"'+(S.settings.theme==='dark'?' selected':'')+'>تیره</option></select></div>';
    h+='<div class="sw"><span>واحد</span><select id="unt"><option value="kg"'+(S.settings.unit==='kg'?' selected':'')+'>کیلوگرم</option><option value="lb"'+(S.settings.unit==='lb'?' selected':'')+'>پوند</option></select></div>';
    h+='<div class="sw"><span>وزن بدن ('+(S.settings.unit==='lb'?'پوند':'کیلو')+')</span><input id="bws" type="number" inputmode="decimal" step="0.5" style="width:100px;min-height:44px;border:2px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);font:inherit;text-align:center" value="'+(S.settings.bw?toDisp(S.settings.bw):'')+'" placeholder="'+(S.settings.unit==='lb'?'۱۵۴':'۷۰')+'"></div>';
    h+='<div class="sw"><span>صدا</span><input type="checkbox" data-a="set" data-k="sound"'+(S.settings.sound?' checked':'')+'></div>';
    h+='<div class="sw"><span>لرزش</span><input type="checkbox" data-a="set" data-k="vibrate"'+(S.settings.vibrate?' checked':'')+'></div>';
    h+='<div class="sw"><span>انیمیشن حرکت در صفحه تمرین</span><input type="checkbox" data-a="set" data-k="mini"'+(S.settings.mini!==false?' checked':'')+'></div>';
    h+='<div class="sw"><span>نمایش عضلات روی انیمیشن</span><input type="checkbox" data-a="set" data-k="muscles"'+(S.settings.muscles!==false?' checked':'')+'></div>';
    h+='<div class="sw"><span>پشتیبان‌گیری</span><button class="ghost" data-a="export">📤 خروجی</button></div>';
    h+='<div class="sw"><span>بازیابی</span><button class="ghost" data-a="import">📥 ورودی</button><input id="imp" type="file" accept="application/json" hidden></div>';
    h+='</section><button class="ghost" data-a="reset" style="margin-top:16px">پاک کردن همه چیز</button>';
  }
  a.innerHTML=h;
  if(tab==='cust')custView(a);
  var thm=$('#thm');if(thm)thm.onchange=function(){A.setTheme(thm.value);};
  var unt=$('#unt');if(unt)unt.onchange=function(){A.setUnit(unt.value);};
}

function applyTheme(){
  var t=S.settings.theme;
  if(t==='auto')document.body.removeAttribute('data-theme');else document.body.dataset.theme=t;
}

if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(function(){});}

