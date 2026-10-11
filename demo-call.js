// Fictional call simulation for the standalone fake-outreach training app.
// Never starts Twilio, dials a number, requests mic access, or contacts a real person.
(()=>{
'use strict';
if(!document.body.classList.contains('page-call'))return;
const $=id=>document.getElementById(id);
let active=false,seconds=0,tick=null,sequence=[],index=0;
const messages=[
 ['You','Hello! This is User with Steady Hands. Is now a good time to speak?'],
 ['Business','Hi! I have a minute. What is this regarding?'],
 ['You','We help local businesses get professional websites at affordable rates.'],
 ['Business','That sounds interesting. Can I see an example?'],
 ['You','Absolutely. I can send a preview showing what your website could look like.'],
 ['Business','Great, please send it over. I would like to review it.'],
 ['You','Of course! I can also follow up at a convenient time.'],
 ['Business','Tomorrow afternoon works for me. Thank you!']
];
function renderStatus(label,mode){
 const status=$('callStatusText');if(status)status.textContent=label;
 const node=document.querySelector('.call-status');if(node)node.dataset.state=mode;
}
function transcript(speaker,text){
 const list=$('liveTranscriptList');if(!list)return;
 list.querySelector('#liveTranscriptEmpty')?.remove();
 const line=document.createElement('div');line.className='demo-transcript-line '+(speaker==='You'?'demo-you':'demo-business');
 const name=document.createElement('strong');name.textContent=speaker;
 const content=document.createElement('p');content.textContent=text;
 line.append(name,content);list.append(line);line.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function statusText(value){const el=$('liveTranscriptStatus');if(el)el.textContent=value;}
function button(){
 const b=$('hangupBtn');if(!b)return;
 b.disabled=false;b.removeAttribute('title');
 b.classList.toggle('hangup',active);b.classList.toggle('start-call',!active);
 b.setAttribute('aria-label',active?'End simulated call':'Start simulated call');
 b.innerHTML='<span class="demo-main-icon" aria-hidden="true"><i data-lucide="phone"></i></span><span>'+(active?'End Demo Call':'Start Demo Call')+'</span>';
 window.lucide?.createIcons();
}
function stop(){
 active=false;clearInterval(tick);tick=null;sequence.forEach(clearTimeout);sequence=[];
 renderStatus('Demo Call Ended','ended');statusText('Example transcript · Demo ended');button();
}
function start(){
 if(active)return;
 active=true;seconds=0;index=0;
 const list=$('liveTranscriptList');if(list)list.innerHTML='';
 const time=$('callTimer');if(time)time.textContent='00:00';
 const wrap=$('callTimerWrap');if(wrap)wrap.hidden=false;
 renderStatus('Connected · Demo','connected');statusText('Simulated transcript · Fictional conversation');
 button();
 tick=setInterval(()=>{
  if(!active)return;
  seconds++;
  if(time)time.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 },1000);
 // Show a natural paced conversation, but do not require audio or device permissions.
 messages.forEach(([speaker,text],i)=>sequence.push(setTimeout(()=>{if(active){index=i+1;transcript(speaker,text)}},1200+i*3600)));
 sequence.push(setTimeout(()=>{if(active){statusText('Example transcript complete · End the demo call when ready')}},1600+messages.length*3600));
}
function capture(event){
 const b=event.target.closest?.('#hangupBtn, #enableLiveTranscript');
 if(!b)return;
 event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
 if(b.id==='hangupBtn'){active?stop():start();}
 else {
  if(!active)start();
  else statusText('Simulated transcript is already enabled');
 }
}
document.addEventListener('click',capture,true);
window.addEventListener('pagehide',()=>{clearInterval(tick);sequence.forEach(clearTimeout)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button);else button();
const text=document.querySelector('#transcriptSection .live-transcript-head p');
if(text)text.textContent='Simulated example conversation · No real phone call or microphone';
const enable=$('enableLiveTranscript');if(enable){enable.disabled=false;enable.innerHTML='View Demo Transcript';enable.removeAttribute('title');}
})();