'use strict';
/* =====================================================================
   custom.js — جلسه‌های سفارشی: ساخت ، ویرایش ، ترتیب و اجرا
   ===================================================================== */
let CE=null;                 /* جلسه سفارشیِ در حال ویرایش */
let PK={q:'',tag:'all',mach:'all'};
let pickBack=false;
const UNITN={'':'تکرار',s:'ثانیه',m:'متر',e:'تکرار هر طرف',t:'دقیقه'};
const UNITSTEP={'':1,s:5,m:5,e:1,t:1};
const TEMPLATES=[
 {name:'تمام بدن بدون دستگاه',ids:['sq','lg','pu','gb','cn','pl','sw']},
 {name:'بالاتنه با دستگاه',ids:['cp','lat','shp','sr','bc','tpd']},
 {name:'پا و باسن',ids:['sq','rdl','lg','ht','lp','le','cr']},
 {name:'هوازی ۳۰ دقیقه',ids:['bk','tm']}
];
function newItem(id){
  var d=LIBDEF[id]||[3,10,'',60];
  return {id:id,n:d[0],reps:d[1],u:d[2],rest:d[3]};
}
function custSteps(c){
  var st=[];
  if(c.warm)st.push({k:'n',t:'گرم کردن',x:WARM,m:{min:5,met:4,cat:'warm'}});
  c.items.forEach(function(it){st.push({k:'s',id:it.id,n:it.n,reps:it.reps,u:it.u,rest:it.rest})});
  if(c.cool)st.push({k:'n',t:'سرد کردن',x:COOL,m:{min:5,met:2.5,cat:'cool'}});
  return st;
}
function custById(id){for(var i=0;i<S.custom.length;i++)if(S.custom[i].id===id)return S.custom[i];return null}
function itemMuscles(id){
  var ex=EX[id];if(!ex)return '';
  return ex.mus.p.map(function(m){return MUSN[m]}).join('، ');
}

/* ---------- نمای لیست ---------- */
function custView(a){
  var h='';
  h+='<button class="primary" data-a="cnew" style="margin-top:6px">＋ ساخت جلسه سفارشی</button>';
  h+='<div class="row" style="margin-top:8px;flex-wrap:wrap">';
  TEMPLATES.forEach(function(t,i){h+='<button class="sec" style="font-size:13px;min-height:44px" data-a="ctpl" data-n="'+i+'">'+t.name+'</button>'});
  h+='</div>';
  if(!S.custom.length)h+='<p class="mut" style="margin-top:20px">هنوز جلسه‌ای نساخته‌ای. با «ساخت جلسه سفارشی» از بین '+fa(Object.keys(E).length)+' حرکت، هر ترکیبی را که دوست داری پشت هم بچین. یا از قالب‌های بالا شروع کن.</p>';
  else{
    h+='<h3>جلسه‌های من</h3><ul class="plan">';
    S.custom.forEach(function(c){
      var est=estimateSteps(custSteps(c));
      h+='<li class="pi" style="grid-template-columns:1fr auto"><div class="pt"><b>'+c.name+'</b><small>'+fa(c.items.length)+' حرکت · حدود '+fa(est.mins)+' دقیقه · 🔥 '+fa(Math.round(est.total))+' کیلوکالری</small></div>'
       +'<div class="pa"><button data-a="cedit" data-n="'+c.id+'" aria-label="ویرایش">✎</button><button data-a="cdup" data-n="'+c.id+'" aria-label="کپی">⧉</button><button data-a="cdel" data-n="'+c.id+'" aria-label="حذف">🗑</button></div>'
       +'<button class="here" data-a="cstart" data-n="'+c.id+'">▶ شروع جلسه</button></li>';
    });
    h+='</ul>';
  }
  a.insertAdjacentHTML('beforeend',h);
}

/* ---------- ویرایشگر ---------- */
function ceditView(a){
  if(!CE){tab='cust';render();return}
  var est=estimateSteps(custSteps(CE));
  var h='<div class="top"><button class="ghost" data-a="ccancel">→ برگشت</button><span class="mut">جلسه سفارشی</span><span></span></div>';
  h+='<input id="cname" class="cname" value="'+CE.name.replace(/"/g,'&quot;')+'" placeholder="نام جلسه" maxlength="40">';
  h+='<div class="fixed">حدود <b>'+fa(est.mins)+'</b> دقیقه · 🔥 حدود <b>'+fa(Math.round(est.total))+'</b> کیلوکالری (با وزن '+fa(Math.round(toDisp(bodyKg())))+' '+(S.settings.unit==='lb'?'پوند':'کیلو')+')</div>';
  h+='<div class="sw" style="padding:6px 0"><span>گرم کردن ابتدای جلسه</span><input type="checkbox" data-a="cflag" data-n="warm"'+(CE.warm?' checked':'')+'></div>';
  h+='<div class="sw" style="padding:6px 0"><span>سرد کردن انتهای جلسه</span><input type="checkbox" data-a="cflag" data-n="cool"'+(CE.cool?' checked':'')+'></div>';
  h+='<div class="row"><button class="sec" data-a="cpick">＋ افزودن حرکت</button><button class="sec" data-a="csort">⚡ بدون دستگاه اول</button></div>';
  h+='<ul class="plan">';
  CE.items.forEach(function(it,i){
    var m=MACH[it.id],cardio=it.u==='t';
    h+='<li class="pi ci"><div class="pn">'+fa(i+1)+'</div><div class="pt"><b>'+E[it.id][0]+'</b><small><span class="badge m'+m+'">'+MLAB[m]+'</span> '+itemMuscles(it.id)+'</small></div>'
     +'<div class="pa"><button data-a="cmv" data-n="'+i+'" data-k="-1" aria-label="بالا">▲</button><button data-a="cmv" data-n="'+i+'" data-k="1" aria-label="پایین">▼</button><button data-a="showAnim" data-n="'+it.id+'" aria-label="نمایش">🎬</button><button data-a="crm" data-n="'+i+'" aria-label="حذف">✕</button></div>'
     +'<div class="cfg">'
     +(cardio?'':stepper('ست',it.n,i,'n'))
     +stepper(UNITN[it.u],it.reps,i,'reps')
     +((cardio||it.n<1)?'':stepper('استراحت (ث)',it.rest,i,'rest'))
     +'</div></li>';
  });
  h+='</ul>';
  if(!CE.items.length)h+='<p class="mut" style="text-align:center">هنوز حرکتی اضافه نشده.</p>';
  h+='<button class="primary" data-a="csave" data-n="start">ذخیره و شروع</button><button class="sec" style="width:100%;margin-top:10px" data-a="csave" data-n="save">فقط ذخیره</button>';
  a.innerHTML=h;
  var cn=$('#cname');if(cn)cn.oninput=function(){CE.name=cn.value};
}
function stepper(label,val,i,f){
  return '<div class="cf"><span>'+label+'</span><div class="st"><button data-a="cstep" data-n="'+i+'" data-k="'+f+':-1" aria-label="کمتر">−</button><b>'+fa(val)+'</b><button data-a="cstep" data-n="'+i+'" data-k="'+f+':1" aria-label="بیشتر">+</button></div></div>';
}

/* ---------- انتخاب حرکت ---------- */
function openPicker(keep){
  if(!keep)PK={q:'',tag:'all',mach:'all'};
  var m=$('#modal');
  var chips='<div class="chips pkc">';
  [['all','همه']].concat(Object.keys(TAGN).map(function(t){return [t,TAGN[t]]})).forEach(function(c){chips+='<button class="pkchip'+(PK.tag===c[0]?' on':'')+'" data-a="pktag" data-n="'+c[0]+'">'+c[1]+'</button>'});
  chips+='</div><div class="chips pkc">';
  [['all','هر نوع'],['0','بدون دستگاه'],['1','وسیله کمکی'],['2','دستگاه']].forEach(function(c){chips+='<button class="pkchip'+(PK.mach===c[0]?' on':'')+'" data-a="pkmach" data-n="'+c[0]+'">'+c[1]+'</button>'});
  chips+='</div>';
  m.innerHTML='<div class="box"><button class="close" id="mclose">✕</button><h3>افزودن حرکت</h3>'
    +'<input id="pkq" class="cname" placeholder="جستجو: نام فارسی یا انگلیسی یا عضله" value="'+PK.q.replace(/"/g,'&quot;')+'">'+chips+'<ul class="lst pkl" id="pkl"></ul></div>';
  m.classList.add('on');
  $('#mclose').onclick=closeModal;
  var q=$('#pkq');q.oninput=function(){PK.q=q.value;pickList()};
  pickList();
}
function pickList(){
  var ul=$('#pkl');if(!ul)return;
  var q=PK.q.trim().toLowerCase(),h='',cnt=0;
  Object.keys(E).forEach(function(id){
    var e=E[id];
    if(PK.tag!=='all'&&LIBTAG[id]!==PK.tag)return;
    if(PK.mach!=='all'&&String(MACH[id])!==PK.mach)return;
    var mus=itemMuscles(id);
    if(q&&(e[0]+' '+e[1]+' '+mus).toLowerCase().indexOf(q)<0)return;
    cnt++;
    var extra=EXTRA.indexOf(id)>=0?' <span class="badge" style="background:#8A4DFF">جدید</span>':'';
    h+='<li class="pki"><div class="pt"><b>'+e[0]+extra+'</b><small><span class="badge m'+MACH[id]+'">'+MLAB[MACH[id]]+'</span> '+mus+'</small></div>'
      +'<div class="pa"><button data-a="pkanim" data-n="'+id+'" aria-label="نمایش">🎬</button><button class="add" data-a="cadd" data-n="'+id+'">＋</button></div></li>';
  });
  ul.innerHTML=h||'<li class="mut" style="text-align:center;padding:16px">چیزی پیدا نشد</li>';
}

/* ---------- عملیات ---------- */
function uid(){return 'c'+Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36)}
Object.assign(A,{
  cnew:function(){CE={id:uid(),name:'جلسه من '+fa(S.custom.length+1),items:[],warm:true,cool:true};tab='cedit';render();},
  ctpl:function(i){var t=TEMPLATES[+i];CE={id:uid(),name:t.name,items:t.ids.map(newItem),warm:true,cool:true};tab='cedit';render();},
  cedit:function(id){var c=custById(id);if(!c)return;CE=clone(c);tab='cedit';render();},
  cdup:function(id){var c=custById(id);if(!c)return;var d=clone(c);d.id=uid();d.name+=' (کپی)';S.custom.push(d);save();render();toast('کپی شد');},
  cdel:function(id){if(!confirm('این جلسه سفارشی حذف شود؟'))return;S.custom=S.custom.filter(function(c){return c.id!==id});save();render();},
  ccancel:function(){CE=null;tab='cust';render();},
  cflag:function(f){CE[f]=!CE[f];render();},
  cpick:function(){openPicker();},
  cadd:function(id){CE.items.push(newItem(id));render();toast(E[id][0]+' اضافه شد');},
  crm:function(i){CE.items.splice(+i,1);render();},
  cmv:function(i,d){
    i=+i;var j=i+(+d);if(j<0||j>=CE.items.length)return;
    var t=CE.items[i];CE.items[i]=CE.items[j];CE.items[j]=t;render();
  },
  csort:function(){
    CE.items=CE.items.map(function(x,i){return {x:x,i:i}}).sort(function(a,b){return MACH[a.x.id]-MACH[b.x.id]||a.i-b.i}).map(function(o){return o.x});
    render();toast('بدون دستگاه‌ها اول آمدند');
  },
  cstep:function(i,k){
    var p=k.split(':'),f=p[0],d=+p[1],it=CE.items[+i];
    if(f==='n')it.n=Math.max(1,Math.min(10,it.n+d));
    else if(f==='reps')it.reps=Math.max(1,Math.min(600,it.reps+d*UNITSTEP[it.u]));
    else if(f==='rest')it.rest=Math.max(0,Math.min(300,it.rest+d*15));
    render();click();
  },
  csave:function(mode){
    var nm=(CE.name||'').trim();
    if(!CE.items.length){toast('حداقل یک حرکت اضافه کن');return}
    CE.name=nm||'جلسه من';
    var idx=-1;S.custom.forEach(function(c,i){if(c.id===CE.id)idx=i});
    var snap=clone(CE);
    if(idx>=0)S.custom[idx]=snap;else S.custom.push(snap);
    save();
    CE=null;
    if(mode==='start'){A.cstart(snap.id);return}
    tab='cust';render();toast('ذخیره شد');
  },
  cstart:function(id){
    var c=custById(id);if(!c)return;
    startCustom(clone(c));
  },
  pktag:function(t){PK.tag=t;openPicker(true);},
  pkmach:function(m){PK.mach=m;openPicker(true);},
  pkanim:function(id){pickBack=true;openAnim(id);}
});
