'use strict';
/* util.js — توابع کمکی، وضعیت ذخیره‌شده، صدا و wake-lock */
const $=function(s){return document.querySelector(s)};
const fa=function(n){return String(n).replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})};
const en=function(s){return String(s).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)})};
const pad=function(n){return String(n).padStart(2,'0')};
const fmtDate=function(t){var d=new Date(t);return fa(d.getFullYear())+'/'+fa(pad(d.getMonth()+1))+'/'+fa(pad(d.getDate()))};
const fmtTime=function(s){return fa(pad(Math.floor(s/60)))+':'+fa(pad(s%60))};

/* ================= STATE ================= */
const DEF={v:5,done:[],w:{},cur:null,log:{},history:[],custom:[],order:{},skip:{},settings:{bw:null,theme:'auto',sound:true,vibrate:true,unit:'kg',muscles:true,mini:true},startedAt:null};
const clone=function(o){return JSON.parse(JSON.stringify(o))};
let S=clone(DEF);
try{var raw=localStorage.getItem('wk');if(raw){S=Object.assign(clone(DEF),JSON.parse(raw));}}catch(e){}
function fix(){S.order=S.order||{};S.skip=S.skip||{};S.history=S.history||[];S.custom=S.custom||[];S.settings=Object.assign({},DEF.settings,S.settings||{});}
fix();
const save=function(){try{localStorage.setItem('wk',JSON.stringify(S))}catch(e){}};
const KG_TO_LB=2.20462;
const toDisp=function(kg){return S.settings.unit==='lb'?Math.round(kg*KG_TO_LB*2)/2:kg};
const fromDisp=function(v){return S.settings.unit==='lb'?Math.round(v/KG_TO_LB*2)/2:v};

/* ================= AUDIO ================= */
let ac=null;
function initAudio(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();}
function beep(f,d,t,g){t=t||0;g=g||.3;if(!S.settings.sound||!ac)return;var o=ac.createOscillator(),v=ac.createGain(),n=ac.currentTime+t;o.frequency.value=f;v.gain.setValueAtTime(g,n);v.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(v);v.connect(ac.destination);o.start(n);o.stop(n+d)}
function ding(){beep(988,.5,0,.5);beep(1319,.8,.25,.5);if(S.settings.vibrate&&navigator.vibrate)navigator.vibrate([200,100,200])}
function click(){beep(660,.06,0,.15);if(S.settings.vibrate&&navigator.vibrate)navigator.vibrate(20)}

/* ================= WAKE LOCK ================= */
let wl=null;
function lock(){try{if('wakeLock' in navigator)navigator.wakeLock.request('screen').then(function(x){wl=x}).catch(function(){})}catch(e){}}
function unlock(){try{if(wl){wl.release();wl=null}}catch(e){}}

