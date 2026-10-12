/* Local fictional-data demonstration; no external account or calling service. */
(function(){'use strict';
const ID='00000000-0000-4000-8000-000000000001', KEY='steadyhands-offline-demo-v1';
const fakeUser={id:ID,email:(localStorage.getItem('steadyhands-demo-email')||'demo@steadyhands.example'),user_metadata:{display_name:'Demo Salesperson',full_name:'Demo Salesperson',name:'Demo Salesperson'},app_metadata:{role:'sales'},role:'authenticated'};
function seed(){const leads=(window.STEADY_HANDS_DEMO_CRM||[]).map(x=>({...x,assigned_user_id:ID,admin_archived:false}));return {crm:leads,callcenter_profiles:[{id:ID,user_id:ID,display_name:'Demo Salesperson',full_name:'Demo Salesperson',email:fakeUser.email,role:'sales',is_active:true,active:true}],team_permissions:[{user_id:ID,role:'SALES',active:true,is_active:true}],sh_pipeline_records:leads.map((x,i)=>({id:'pipe-'+i,crm_id:x.id,salesperson_user_id:ID,owner_id:ID,company_name:x.company,contact_name:x.name,phone:x.phone,email:x.email,sitekey:x.sitekey,previewurl:x.previewurl,stage:(({contacted:'called','follow up':'follow_up','follow-up':'follow_up',interested:'follow_up',sold:'ready_to_buy','ready to buy':'ready_to_buy'}[String(x.stage||'').toLowerCase()])||'called'),follow_up_category:null,notes:x.notes,created_at:x.created,updated_at:x.updated})) , outreach_queues:[{id:'demo-queue-1',name:'My Demo Queue',owner_id:ID,queue_type:'custom',sort_mode:'manual',is_active:true,filters:{limit:25,auto_add:false},created_at:new Date().toISOString()}],outreach_queue_items:[],callcenter_commissions:[],callcenter_call_activity:[],callcenter_scheduled_calls:[],callcenter_call_feedback:[],callcenter_transcripts:[],callcenter_push_subscriptions:[],site_keys:[],callcenter_phone_numbers:[],sh_sales_goals:[],sh_sales_targets:[]};}
let store;try{store=JSON.parse(localStorage.getItem(KEY));}catch(_){}if(!store||!Array.isArray(store.crm)||!store.crm.length)store=seed();
// Upgrade previously saved demo data without changing or deleting contacts.
store.crm.forEach(lead=>{lead.assigned_user_id=ID;lead.admin_archived=false;});
store.team_permissions=[{user_id:ID,role:'SALES',active:true,is_active:true}];
// Fictional examples populate the offline demo once, including existing browser demo sessions.
function fillDemoExamples(){
 const version='sales-examples-v4-flat30-weekly';
 if(store._exampleVersion===version)return;
 const stages=['called','follow_up','portal_link_sent','account_created','reviewing_site','ready_to_buy'];
 const followUps=['Interested','Unsure','Needs More Info','Not Now','Budget Concerns'];
 const leads=store.crm||[];
 const now=Date.now(), day=86400000;
 store.sh_pipeline_records=leads.map((lead,i)=>{
   const prev=(store.sh_pipeline_records||[]).find(r=>String(r.crm_id)===String(lead.id))||{};
   const stage=stages[i%stages.length];
   return {...prev,id:prev.id||'pipe-'+i,crm_id:lead.id,salesperson_user_id:ID,owner_id:ID,
    company_name:lead.company||prev.company_name||'Demo business',contact_name:lead.name||prev.contact_name||'',
    phone:lead.phone||prev.phone||'',email:lead.email||prev.email||'',sitekey:lead.sitekey||prev.sitekey,
    previewurl:lead.previewurl||prev.previewurl,stage,follow_up_category:stage==='follow_up'?followUps[Math.floor(i/6)%followUps.length]:null,
    notes:prev.notes||lead.notes||'',created_at:prev.created_at||new Date(now-(i+2)*day/3).toISOString(),updated_at:new Date(now-(i%7)*day/5).toISOString()};
 });
 const activities=[]; const transcripts=[];const feedback=[];
 const outcomes=['Interested','Follow Up','Not Interested','No Answer','Call Back','Needs More Info','Positive'];
 for(let i=0;i<56&&leads.length;i++){
   const lead=leads[(i*7)%leads.length], when=new Date(now-((i%7)*day)-((i%8)+1)*3600000).toISOString();
   const activityId='demo-activity-'+i, transcriptId='demo-transcript-'+i;
   const outcome=outcomes[i%outcomes.length];
   activities.push({id:activityId,user_id:ID,crm_id:lead.id,company:lead.company,contact:lead.name,phone:lead.phone,
     duration_seconds:65+(i*37)%410,outcome,call_type:i%3?'app':'regular',created_at:when});
   if(i<24){
      const body='Salesperson: Hi! This is a fictional practice call from Steady Hands.\nProspect: Hello, what is this about?\nSalesperson: I am reaching out about a website preview for your business.\nProspect: Can you send me more information?\nSalesperson: Absolutely, I can follow up with the details.\nProspect: That sounds good, thank you.';
      transcripts.push({id:transcriptId,user_id:ID,crm_id:lead.id,call_activity_id:activityId,company:lead.company,
         contact:lead.name,phone:lead.phone,started_at:when,ended_at:when,duration_seconds:activities[i].duration_seconds,
         transcript:body,segments:[],outcome,created_at:when});
      feedback.push({id:'demo-feedback-'+i,user_id:ID,transcript_id:transcriptId,
        summary:'Fictional training example: clear introduction and a helpful next step.',
        strengths:['Clear introduction','Polite tone'],improvements:['Ask a follow-up question'],
        sentiment:i%3===0?'positive':'neutral',scores:{clarity:4,confidence:4,rapport:4},created_at:when,updated_at:when});
   }
 }
 store.callcenter_call_activity=activities;
 store.callcenter_transcripts=transcripts;
 store.callcenter_call_feedback=feedback;
 // Varied fictional deals: a mix of earned, processing, and unpaid commissions.
 const demoDeals=[
   ['complete',30,100,0],['pending',30,100,0],['complete',30,100,1],
   ['waiting_client_payment',30,100,1],['complete',30,100,2],['pending',30,100,2],
   ['complete',30,100,3],['complete',30,100,3],['waiting_client_payment',30,100,4],
   ['pending',30,100,4],['complete',30,100,5],['pending',30,100,5],
   ['complete',30,100,6],['waiting_client_payment',30,100,6],['complete',30,100,8],
   ['pending',30,100,9],['complete',30,100,11],['complete',30,100,13]
 ];
 store.callcenter_commissions=demoDeals.map(([status,commission,sale,daysAgo],i)=>{
   const lead=leads[(i*5)%leads.length]||{};
   const when=new Date(now-daysAgo*day-(i%4)*3600000).toISOString();
   return {id:'demo-commission-'+i,user_id:ID,salesperson_user_id:ID,crm_id:lead.id,
    client_name:lead.company||'Fictional company',company:lead.company||'Fictional company',
    commission_amount_cents:commission*100,sale_amount_cents:sale*100,status,
    created_at:when,updated_at:when,completed_at:status==='complete'?when:null};
 });
 store._exampleVersion=version;
}
fillDemoExamples();
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){console.warn('Demo data could not be saved:',e);}}
save();window.SteadyHandsDemo={enabled:true,user:fakeUser,reset(){store=seed();save();location.reload()},get crm(){return store.crm}};
let serial=1000;
const clone=v=>JSON.parse(JSON.stringify(v));
class Query{
 constructor(table){this.table=table;this.op='select';this.conditions=[];this.sort=null;this.offset=0;this.cap=Infinity;this.wantSingle=false;this.head=false;this.countType=null;this.columns='*';this.payload=null;this.upsertOptions={};}
 select(cols='*',opts={}){this.columns=cols;this.head=!!opts.head;this.countType=opts.count||null;return this}
 eq(k,v){this.conditions.push(r=>String(r[k]??'')===String(v??''));return this}
 neq(k,v){this.conditions.push(r=>String(r[k]??'')!==String(v??''));return this}
 in(k,vs){this.conditions.push(r=>(vs||[]).some(v=>String(v)===String(r[k])));return this}
 ilike(k,v){let test=String(v).replace(/[%]/g,'').toLowerCase();this.conditions.push(r=>String(r[k]??'').toLowerCase().includes(test));return this}
 like(k,v){return this.ilike(k,v)}
 is(k,v){this.conditions.push(r=>v===null?r[k]==null:String(r[k])===String(v));return this}
 not(k,operator,v){if(operator==='is')this.conditions.push(r=>v===null?r[k]!=null:String(r[k])!==String(v));return this}
 gt(k,v){this.conditions.push(r=>r[k]>v);return this}gte(k,v){this.conditions.push(r=>r[k]>=v);return this}lt(k,v){this.conditions.push(r=>r[k]<v);return this}lte(k,v){this.conditions.push(r=>r[k]<=v);return this}
 or(_expr){return this}filter(k,op,v){if(op==='eq')return this.eq(k,v);return this}
 order(k,{ascending=true}={}){this.sort=[k,ascending];return this}
 range(a,b){this.offset=a;this.cap=b-a+1;return this}limit(n){this.cap=n;return this}
 single(){this.wantSingle=true;return this}maybeSingle(){return this.single()}
 insert(v){this.op='insert';this.payload=v;return this}
 upsert(v,o={}){this.op='upsert';this.payload=v;this.upsertOptions=o;return this}
 update(v){this.op='update';this.payload=v;return this}
 delete(){this.op='delete';return this}
 then(ok,bad){return Promise.resolve().then(()=>this.exec()).then(ok,bad)}
 exec(){let all=store[this.table]||(store[this.table]=[]);let filtered=all.filter(r=>this.conditions.every(fn=>fn(r)));const count=filtered.length;let result;
 if(this.op==='select'){if(this.sort){const [k,asc]=this.sort;filtered.sort((a,b)=>String(a[k]??'').localeCompare(String(b[k]??''),undefined,{numeric:true})*(asc?1:-1))}result=filtered.slice(this.offset,this.offset+this.cap).map(x=>clone(x));if(this.columns!=='*'&&!this.columns.includes('(')){const keys=this.columns.split(',').map(x=>x.trim().split(':').pop());result=result.map(row=>Object.fromEntries(keys.filter(k=>k in row).map(k=>[k,row[k]])))}}
 else if(this.op==='insert'||this.op==='upsert'){let items=(Array.isArray(this.payload)?this.payload:[this.payload]).map(x=>({...x,id:x.id||('demo-'+(++serial)),created_at:x.created_at||new Date().toISOString()}));for(const item of items){let conflict=(this.upsertOptions.onConflict||'id').split(',');let existing=all.find(r=>conflict.every(k=>String(r[k])===String(item[k])));if(existing&&this.op==='upsert'){if(!this.upsertOptions.ignoreDuplicates)Object.assign(existing,item)}else all.push(item)}result=items;save()}
 else if(this.op==='update'){for(const r of filtered)Object.assign(r,this.payload);result=filtered.map(clone);save()}
 else{store[this.table]=all.filter(r=>!filtered.includes(r));result=filtered.map(clone);save()}
 if(this.head)result=null;
 if(this.wantSingle)result=Array.isArray(result)?(result[0]||null):result;
 return {data:result,error:null,count:this.countType?count:null,status:200};}
}
const auth={getSession:async()=>({data:{session:localStorage.getItem('steadyhands-demo-login')==='yes'?{user:fakeUser,access_token:'offline-demo',expires_at:4102444800}:null},error:null}),getUser:async()=>({data:{user:localStorage.getItem('steadyhands-demo-login')==='yes'?fakeUser:null},error:null}),signInWithPassword:async({email,password}={})=>{if(!email?.includes('@')||!password)return {data:{user:null,session:null},error:{message:'Enter an email and password for demo access.'}};localStorage.setItem('steadyhands-demo-login','yes');localStorage.setItem('steadyhands-demo-email',email);fakeUser.email=email;return {data:{user:fakeUser,session:{user:fakeUser}},error:null}},signUp:async()=>({data:{user:fakeUser,session:{user:fakeUser}},error:null}),signOut:async()=>{localStorage.removeItem('steadyhands-demo-login');return {error:null}},onAuthStateChange(fn){return {data:{subscription:{unsubscribe(){}}}}},resetPasswordForEmail:async()=>({data:{},error:null}),updateUser:async()=>({data:{user:fakeUser},error:null})};
const client={auth,from:t=>new Query(t),rpc:async(name)=>({data:name==='sh_team_weekly_confirmed_sales'?0:name==='callcenter_unavailable_leads'?[]:[],error:null}),functions:{invoke:async()=>({data:null,error:{message:'Demo mode: external services are disabled'}})},channel:()=>({on(){return this},subscribe(){return this},unsubscribe(){}}),removeChannel:async()=>{},storage:{from:()=>({upload:async()=>({error:{message:'Demo mode'}}),getPublicUrl:()=>({data:{publicUrl:''}})})}};
if(!location.pathname.endsWith('/login.html')&&localStorage.getItem('steadyhands-demo-login')!=='yes'){location.replace('login.html');}window.supabase={createClient:()=>client};window.steadyHandsCRMClient=client;window.steadyHandsOutreachUserId=ID;
window.addEventListener('DOMContentLoaded',()=>{const badge=document.createElement('div');badge.textContent='DEMO MODE · 100 fictional contacts · Local only';badge.style.cssText='position:fixed;right:12px;bottom:12px;z-index:99990;padding:8px 12px;border-radius:9px;background:#102945;color:white;font:600 12px system-ui;box-shadow:0 3px 16px #0003;pointer-events:none';document.body.appendChild(badge)});
})();
