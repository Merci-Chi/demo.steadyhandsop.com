/* Local-only demo simulator. No phone, microphone, or remote services. */
(()=>{
  'use strict';
  let active=false, held=false, muted=false, transcribing=false, interval=null, lineIndex=0;
  const lines=[
    ['You','Hello! This is Demo User with Steady Hands. Is now a good time?'],
    ['Client','Hi! Yes, I have a minute.'],
    ['You','I created a sample website concept for your business.'],
    ['Client','That sounds interesting. How much would it cost?'],
    ['You','The demo pricing is $100 for development and $20 per month for standard hosting.'],
    ['Client','Can I see an example before deciding?'],
    ['You','Absolutely! I can show you the sample site preview.'],
    ['Client','Sounds good. I will take a look and get back to you.']
  ];
  function button(){return document.getElementById('enableLiveTranscript')}
  function status(message){const el=document.getElementById('liveTranscriptStatus');if(el)el.textContent=message}
  function updateButton(){const el=button();if(!el)return;el.textContent=transcribing?'Stop Demo Transcript':'Start Demo Transcript';el.setAttribute('aria-pressed',String(transcribing))}
  function stopTranscript(){transcribing=false;if(interval!==null)clearInterval(interval);interval=null;updateButton();status('Demo transcript is off')}
  function addLine(){
    if(!transcribing)return;
    const list=document.getElementById('liveTranscriptList');
    if(!list){stopTranscript();return}
    list.querySelector('#liveTranscriptEmpty')?.remove();
    const [speaker,line]=lines[lineIndex++%lines.length];
    const row=document.createElement('div');row.className='live-transcript-row';
    const meta=document.createElement('div');meta.className='transcript-meta';
    const time=document.createElement('span');time.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    const who=document.createElement('strong');who.textContent=speaker;
    meta.append(time,who);
    const bubble=document.createElement('div');bubble.className='transcript-bubble';
    bubble.classList.add(speaker==='You'?'muted':'prospect');bubble.textContent=line;
    row.append(meta,bubble);list.appendChild(row);list.scrollTop=list.scrollHeight;
    status('Demo transcript running · Fictional conversation');
  }
  function toggleTranscript(){
    if(transcribing){stopTranscript();return}
    transcribing=true;
    updateButton();
    addLine();
    interval=setInterval(addLine,2600);
  }
  function emit(state){window.dispatchEvent(new CustomEvent('steadyhands:voice-state',{detail:{state,callSid:state==='connected'?'demo-call':'',demo:true}}))}
  window.SteadyHandsTwilioVoice={
    async start(){active=true;emit('calling');setTimeout(()=>{if(active)emit('connected')},450);return true},
    hangup(){active=false;stopTranscript();emit('ended')},
    setHeld:async value=>(held=!!value),setMuted:value=>(muted=!!value),isConnected:()=>active
  };
  // Capture before the legacy real-transcription listener, which must never run in demo mode.
  document.addEventListener('click',event=>{
    const target=event.target;
    const transcriptButton=target?.closest?.('#enableLiveTranscript');
    if(transcriptButton){event.preventDefault();event.stopImmediatePropagation();toggleTranscript();return}
    const external=target?.closest?.('#externalDialerLink');
    if(external){event.preventDefault();event.stopImmediatePropagation();alert('Calls are simulated in this demo.')}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateButton,{once:true});
  else updateButton();
})();
