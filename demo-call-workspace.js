/* Fully local Steady Hands call simulation. No outgoing calls or recordings. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const leadId = new URLSearchParams(location.search).get('crm_id') || sessionStorage.getItem('steadyhands-selected-outreach-crm-id');
const contacts = window.STEADY_HANDS_DEMO_CRM || window.SteadyHandsDemo?.crm || [];
const prospect = contacts.find(x => String(x.id) === String(leadId)) || contacts[0] || null;
let active = false, held = false, muted = false, speaker = false, elapsed = 0, tick = null, transcriptTick = null, index = 0;
const fmt = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
const scripts = () => {
 const contact = prospect?.name?.split(' ')[0] || 'there';
 return [['You',`Hey ${contact}, my name is Alex. I'm calling from Steady Hands. Is now a good time?`],['Prospect','Sure, I have a few minutes.'],['You',`I wanted to talk about a website preview for ${prospect?.company || 'your business'}.`],['Prospect','That sounds good. What would the cost be?'],['You','Website development is $100 one-time, with hosting starting at $20 per month.'],['Prospect','Could you send me a preview to review?'],['You','Absolutely. I can send it along and follow up later.'],['Prospect','Great, thank you!']];
};
function setStatus(s) { if ($('refStatus')) $('refStatus').textContent=s; }
function transcriptStatus(s) { if ($('refTranscriptStatus')) $('refTranscriptStatus').textContent=s; }
function setTranscriptButton(s){ if($('demoTranscriptToggle')) $('demoTranscriptToggle').textContent=s; }
function stopTranscript(){ clearInterval(transcriptTick); transcriptTick=null;setTranscriptButton(index>=scripts().length?'Restart Transcript':'Start Transcript'); }
function nextLine(){ const pair=scripts()[index++]; if(!pair){stopTranscript();transcriptStatus('Demo transcript complete');return;}
 const row=document.createElement('div');row.className='demo-transcript-line';
 const label=document.createElement('strong');label.textContent=pair[0]; const body=document.createElement('p');body.textContent=pair[1];row.append(label,body);$('refTranscriptList').append(row);requestAnimationFrame(() => { const log = $('refTranscriptList'); if(log) log.scrollTop = log.scrollHeight; });
 if(index>=scripts().length){stopTranscript();transcriptStatus('Demo transcript complete');}
}
function playTranscript(){ if(!active){transcriptStatus('Start the demo call first');return;} if(transcriptTick){stopTranscript();transcriptStatus('Transcript paused');return;}
 if(index>=scripts().length){index=0;$('refTranscriptList').replaceChildren();}
 nextLine();if(index<scripts().length){transcriptTick=setInterval(nextLine,2200);setTranscriptButton('Stop Transcript');transcriptStatus('Demo transcript playing');}
}
function render(){const btn=$('refEndCall');if(!btn)return;
 btn.disabled=false;btn.dataset.callState=active?'active':'idle';btn.classList.toggle('is-active',active);btn.classList.toggle('is-idle',!active);
 btn.setAttribute('aria-label',active?'Hang Up':'Start Call');$('refPhoneActionLabel').textContent=active?'Hang Up':'Start Call';
 if($('refCallTimer')){$('refCallTimer').hidden=!active;$('refCallTimer').textContent=fmt(elapsed);}
 if(active)setStatus(held?'Simulated call on hold':'Simulated call in progress');
 else setStatus(prospect?'Ready to call':'No demo prospect available');
}
function hangup(){active=false;held=false;clearInterval(tick);tick=null;stopTranscript();transcriptStatus('Call ended');render();}
function toggleCall(){if(active){hangup();return;}active=true;held=false;elapsed=0;index=0;$('refTranscriptList').replaceChildren();
 transcriptStatus('Call started · Start Transcript when ready');tick=setInterval(()=>{if(!held)elapsed++;render();},1000);render();}
function configureControl(id,label,action){const el=$(id);if(!el)return;
 el.addEventListener('click',()=>{action();el.classList.toggle('demo-enabled',id==='refMute'?muted:id==='refHold'?held:speaker);el.setAttribute('aria-pressed',String(id==='refMute'?muted:id==='refHold'?held:speaker)); if(active)render();});}
function init(){if(!$('refEndCall'))return;
 if(prospect){$('refCompany').textContent=prospect.company||prospect.company_name||'Demo Prospect';$('refPhone').textContent=prospect.phone||prospect.number||'Demo phone unavailable';
 window.steadyHandsCallLead={...prospect,number:prospect.phone||prospect.number||'',contact:prospect.name||prospect.contact_name||''};
 try{sessionStorage.setItem('steadyhands-selected-outreach-crm-id',prospect.id);}catch(_){}
 const clock=()=>{try{$('refLocalTime').textContent=new Intl.DateTimeFormat('en-US',{timeZone:prospect.timezone||'America/Los_Angeles',weekday:'long',hour:'numeric',minute:'2-digit'}).format(new Date());}catch(_){$('refLocalTime').textContent='Local time unavailable';}};clock();setInterval(clock,60000);
 }else{$('refCompany').textContent='Demo Prospect';}
 // Bind call controls directly; do not depend on live dialer modules.
 $('refEndCall').addEventListener('click',toggleCall);
 configureControl('refMute','Mute',()=>{muted=!muted;});
 configureControl('refHold','Hold',()=>{if(active)held=!held;});
 configureControl('refSpeaker','Speaker',()=>{speaker=!speaker;});
 const keypad=$('refKeypad');if(keypad)keypad.addEventListener('click',()=>{
 let panel=$('demoKeypad');if(panel){panel.remove();return;}
 panel=document.createElement('div');panel.id='demoKeypad';panel.className='demo-keypad';for(const number of '123456789*0#'){const b=document.createElement('button');b.type='button';b.textContent=number;b.addEventListener('click',()=>{transcriptStatus(`Demo keypad: ${number}`);});panel.append(b);}document.querySelector('.ref-call-controls')?.after(panel);
 });
 const header=document.querySelector('.ref-transcript-header');if(header&&!$('demoTranscriptToggle')){const wrap=document.createElement('div');wrap.className='demo-transcript-controls';const b=document.createElement('button');b.type='button';b.id='demoTranscriptToggle';b.textContent='Start Transcript';wrap.append(b);const note=document.createElement('span');note.textContent='Fictional conversation · No real calls or recording';wrap.append(note);header.after(wrap);b.addEventListener('click',playTranscript);}
 const sale=$('refStartSale');if(sale)sale.addEventListener('click',e=>{e.preventDefault();location.href='sales.html'+(prospect?'?crm_id='+encodeURIComponent(prospect.id):'');},true);
 const css=document.createElement('style');css.textContent='body.page-outreach .ref-transcript-card{height:440px!important;min-height:0!important;max-height:440px!important;overflow:hidden;box-sizing:border-box}body.page-outreach .ref-transcript-list{min-height:0!important;flex:1 1 0!important;overflow-y:auto!important;overscroll-behavior:contain;display:flex;flex-direction:column;justify-content:flex-start!important;scroll-behavior:smooth}body.page-outreach .ref-transcript-list::before{content:"";margin-top:auto}body.page-outreach .ref-transcript-list .demo-transcript-line{flex-shrink:0}@media(max-width:720px){body.page-outreach .ref-transcript-card{height:480px!important;max-height:480px!important}}.demo-transcript-controls{padding:12px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.demo-transcript-controls button{border:0;border-radius:11px;background:#087cf6;color:#fff;font-weight:750;padding:11px 15px;cursor:pointer}.demo-transcript-controls span{font-size:12px;color:#70849c}.demo-transcript-line{margin:9px 12px;padding:12px 15px;border-radius:13px;background:#f2f6fb;color:#172e49}.demo-transcript-line strong{color:#087cf6}.demo-transcript-line p{margin:5px 0 0;line-height:1.45}.ref-call-control.demo-enabled .ref-control-circle{background:#ddecff;border-color:#087cf6}.demo-keypad{display:grid;grid-template-columns:repeat(3,minmax(55px,1fr));max-width:280px;gap:9px;margin:12px auto}.demo-keypad button{background:#edf5ff;border:1px solid #b5d4ff;border-radius:12px;padding:12px;font-weight:700;cursor:pointer}';document.head.append(css);
 render();window.dispatchEvent(new Event('steadyhands:call-lead-ready'));
 window.addEventListener('pagehide',()=>{clearInterval(tick);stopTranscript();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
