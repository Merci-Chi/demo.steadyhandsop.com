/* LOCAL DEMO ONLY: no Supabase network connection. */
(() => {
 'use strict';
 const KEY = 'steadyhands-offline-demo-v1';
 const user={id:'demo-user',email:'demo@steadyhands.example',user_metadata:{full_name:'User'}};
 const session={user,access_token:'offline-demo-only'};
 function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
 function write(data){localStorage.setItem(KEY,JSON.stringify(data))}
 const seeds=()=>window.STEADY_HANDS_DEMO_LEADS||[];
 function table(name){const s=read();if(name==='crm')return seeds().map(x=>({...x,...(window.STEADY_HANDS_DEMO_HISTORY.callbacks||{})[x.id],...(s.crm||{})[x.id]}));
  if(name==='preview_inventory')return seeds().map(x=>({url:x.previewurl,crm_id:x.id}));
  if(name==='site_keys')return seeds().map(x=>({sitekey:x.sitekey,site_key:x.sitekey,url:x.previewurl,previewurl:x.previewurl}));
  if(name==='callcenter_call_activity')return [...(s[name]||[]),...window.STEADY_HANDS_DEMO_HISTORY.calls].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
  if(name==='callcenter_transcripts')return [...(s[name]||[]),...window.STEADY_HANDS_DEMO_HISTORY.transcripts];
  if(name==='callcenter_commissions')return [...(s[name]||[]),...window.STEADY_HANDS_DEMO_HISTORY.commissions];
  if(name==='team_permissions')return [{user_id:user.id,role:'ADMIN',active:true}];
  if(name==='callcenter_profiles')return [{user_id:user.id,id:user.id,full_name:'User',display_name:'User',name:'User',email:'demo@steadyhands.example',assigned_state:'NV',assigned_timezone:'America/Los_Angeles',referral_code:'DEMO-ONLY',active:true,onboarding_completed:true,created_at:new Date().toISOString(),last_call_at:new Date().toISOString(),disabled_at:null}];
  return s[name]||[];
 }
 class Query {
  constructor(name){this.name=name;this.filters=[];this.start=null;this.end=null;this.countRequested=false;this.returnSingle=false;this.mode='select';this.patch=null;}
  select(c,opts={}){this.countRequested=opts.count==='exact';return this}
  eq(k,v){this.filters.push(x=>String(x[k]??'')===String(v??''));return this}
  neq(k,v){this.filters.push(x=>String(x[k]??'')!==String(v??''));return this}
  in(k,v){this.filters.push(x=>v.map(String).includes(String(x[k])));return this}
  is(k,v){this.filters.push(x=>v===null?x[k]==null:x[k]===v);return this}
  not(k,op,v){this.filters.push(x=>op==='is'&&v===null?x[k]!=null:true);return this}
  or(){return this} like(){return this} ilike(){return this} contains(){return this} overlaps(){return this}
  gt(k,v){this.filters.push(x=>x[k]>v);return this} gte(k,v){this.filters.push(x=>x[k]>=v);return this}
  lt(k,v){this.filters.push(x=>x[k]<v);return this} lte(k,v){this.filters.push(x=>x[k]<=v);return this}
  order(k,{ascending=true}={}){this.sort={k,ascending};return this}
  limit(n){this.end=n-1;return this} range(a,b){this.start=a;this.end=b;return this}
  single(){this.returnSingle=true;return this} maybeSingle(){this.returnSingle=true;return this}
  insert(v){this.mode='insert';this.patch=v;return this} upsert(v){this.mode='upsert';this.patch=v;return this}
  update(v){this.mode='update';this.patch=v;return this} delete(){this.mode='delete';return this}
  then(ok,bad){try{let rows=table(this.name).filter(x=>this.filters.every(f=>f(x))); const count=rows.length;
   if(this.mode!=='select'){const state=read();if(this.name==='crm'){
     const overrides=state.crm||{}; for(const r of rows){if(this.mode==='delete')overrides[r.id]={stage:'notinterested'};else overrides[r.id]={...(overrides[r.id]||{}),...(this.patch||{})}}state.crm=overrides;
   } else {let arr=state[this.name]||[];if(this.mode==='insert'||this.mode==='upsert'){let additions=Array.isArray(this.patch)?this.patch:[this.patch];arr.push(...additions.map((x,i)=>({id:x.id||'demo-'+Date.now()+'-'+i,...x})));}else if(this.mode==='delete')arr=arr.filter(x=>!rows.includes(x));else arr=arr.map(x=>rows.includes(x)?{...x,...this.patch}:x);state[this.name]=arr;}write(state);
    if(this.mode==='insert'||this.mode==='upsert')rows=Array.isArray(this.patch)?this.patch:[this.patch];}
   if(this.sort)rows.sort((a,b)=>String(a[this.sort.k]??'').localeCompare(String(b[this.sort.k]??''))*(this.sort.ascending?1:-1));
   if(this.start!=null||this.end!=null)rows=rows.slice(this.start||0,this.end==null?undefined:this.end+1);
   return Promise.resolve({data:this.returnSingle?(rows[0]||null):rows,error:null,count}).then(ok,bad)
  }catch(e){return Promise.resolve({data:null,error:{message:e.message}}).then(ok,bad)}}
 }
 const client={auth:{getSession:async()=>({data:{session},error:null}),getUser:async()=>({data:{user},error:null}),signOut:async()=>({error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signInWithPassword:async()=>({data:{session,user},error:null}),resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({data:{user},error:null})},from:n=>new Query(n),rpc:async n=>({data:n==='callcenter_unavailable_leads'?[]:[],error:null}),functions:{invoke:async()=>({data:null,error:{message:'Disabled in offline demo'}})},channel:()=>({on(){return this},subscribe(){return this},unsubscribe(){}}),storage:{from:()=>({upload:async()=>({error:{message:'Demo only'}}),getPublicUrl:()=>({data:{publicUrl:''}})})}};
 window.supabase={createClient:()=>client};window.steadyHandsCRMClient=client;window.steadyHandsDemo=true;
 window.steadyHandsResetDemo=()=>{localStorage.removeItem(KEY);location.replace('index.html')};
 // Remove legacy top-of-page notice even if old code inserts it late.
 function removeOldDemoNotice(){
   const banner=document.getElementById('demoBanner');
   if(banner) banner.remove();
 }
 removeOldDemoNotice();
 const demoNoticeObserver=new MutationObserver(removeOldDemoNotice);
 demoNoticeObserver.observe(document.documentElement,{childList:true,subtree:true});

 // Calling is handled by demo-call.js: no real phone network is used.
 window.addEventListener('DOMContentLoaded',()=>{
   if(!document.body.classList.contains('page-call'))return;
   const txt=document.querySelector('#transcriptSection .live-transcript-head p');
   if(txt)txt.textContent='Example conversation generated for training. No real call or microphone access.';
 });

})();
