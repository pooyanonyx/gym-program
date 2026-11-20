'use strict';
/* =====================================================================
   calories.js — تخمین کالری بر اساس MET
   کالری = (MET + بونوس بار) × وزن بدن (کیلو) × مدت (ساعت)
   - مدت هر ست: تعداد تکرار × زمان هر تکرار ، یا ثانیه واقعی نگه‌داشتن
   - بونوس بار: حرکت‌های وزنه‌ای تا +۲٫۵ MET بر اساس نسبت وزنه به وزن بدن
     بارفیکس کمکی: هرچه کمک کمتر ، سخت‌تر
   - استراحت بین ست‌ها: MET ۱٫۸ برای زمان واقعی استراحت
   - مقدار گرم‌کردن ، هوازی و سرد کردن از مدت و MET هر مرحله
   خروجی تخمین است (±۲۵٪) و شامل متابولیسم پایه در طول تمرین می‌شود.
   ===================================================================== */
const REST_MET=1.8;
function bodyKg(){return S.settings.bw||70}
function setKcal(r,bw){
  var c=CAL[r.id];if(!c)return 0;
  var met=c[0],sec=0,walk=0,bonus=0,reps=+r.reps||0,w=+r.w||0;
  if(r.u==='s')sec=+r.secs||reps;
  else if(r.u==='t')sec=(+r.secs||reps*60);
  else if(r.u==='m'){sec=reps*c[1];walk=sec}
  else sec=(r.u==='e'?reps*2:reps)*c[1];
  if(c[2]==='l'&&w>0)bonus=2.5*Math.min(1.2,w/bw);
  else if(c[2]==='a')bonus=2*Math.max(0,1-w/bw);
  return (met+bonus)*bw*sec/3600+3.5*bw*walk/3600;
}
function isCardioId(id){return id==='tm'||id==='bk'}
/* جمع‌بندی یک جلسه واقعی */
function calcSession(R,bw){
  bw=bw||bodyKg();
  var p={sets:0,cardio:0,warm:0,rest:0},per={},i,k,v;
  (R.sets||[]).forEach(function(s){
    v=setKcal(s,bw);
    if(isCardioId(s.id))p.cardio+=v;else p.sets+=v;
    per[s.id]=(per[s.id]||0)+v;
  });
  (R.notes||[]).forEach(function(n){
    v=n.met*bw*n.min/60;
    if(n.cat==='cardio')p.cardio+=v;else p.warm+=v;
  });
  p.rest=REST_MET*bw*(R.restSec||0)/3600;
  return {total:p.sets+p.cardio+p.warm+p.rest,parts:p,per:per};
}
/* پیش‌بینی از روی مراحل برنامه‌ریزی‌شده */
function estimateSteps(steps,bw){
  bw=bw||bodyKg();
  var R={sets:[],notes:[],restSec:0},mins=0;
  steps.forEach(function(st){
    if(st.k==='n'){if(st.m){R.notes.push(st.m);mins+=st.m.min}return}
    var h=S.log&&S.log[st.id],last=h&&h.length?h[h.length-1].weight:0;
    for(var i=0;i<st.n;i++){
      R.sets.push({id:st.id,reps:st.reps,u:st.u,w:last});
      var c=CAL[st.id]||[3,3.5],sec=st.u==='s'?st.reps:st.u==='t'?st.reps*60:st.u==='m'?st.reps*c[1]*2:(st.u==='e'?st.reps*2:st.reps)*c[1];
      mins+=sec/60;
      if(i<st.n-1||true)R.restSec+=st.rest||0;
    }
  });
  mins+=R.restSec/60;
  var r=calcSession(R,bw);r.mins=Math.round(mins);return r;
}
function kcalText(v){return fa(Math.round(v))+' کیلوکالری'}
