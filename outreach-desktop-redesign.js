
(() => {
  'use strict';
  if (!document.body.classList.contains('page-outreach') || document.body.classList.contains('page-leads')) return;

  const selected = document.getElementById('selectedLeadTop');
  const info = document.getElementById('shCallInfo');
  const activity = document.getElementById('shRecentActivity');
  const quickNotes = document.getElementById('shQuickNotes');

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const text = (selector, root=document) => root.querySelector(selector)?.textContent?.replace(/\s+/g,' ').trim() || '';
  const html = (selector, root=document) => root.querySelector(selector)?.innerHTML || '';
  let notesLeadId = '';
  let notesChanged = false;
  let busy = false;
  const crm = () => window.steadyHandsCRMClient || null;
  const notify = msg => {
    const status = quickNotes?.querySelector('#workspaceNoteStatus');
    if(status) status.textContent=msg;
  };


  function renderCallInfo(data) {
    if (!info) return;
    if (!data.crmId) {
      info.innerHTML = '<div class="workspace-card-head"><i data-lucide="phone"></i><h2>Call Information</h2></div><div class="workspace-side-empty">Select a lead to see calling details.</div>';
      window.lucide?.createIcons?.();
      return;
    }
    info.innerHTML = `
      <div class="workspace-card-head"><i data-lucide="phone"></i><h2>Call Information</h2></div>
      <div class="workspace-side-stack">
        <div class="workspace-side-block">
          <div class="workspace-side-label"><i data-lucide="clock-3"></i><span>Best Time to Call</span></div>
          <div class="workspace-callout"><i data-lucide="phone-call"></i><div>${escapeHTML(data.callStatus || 'Call timing unavailable')}</div></div>
        </div>
        <div class="workspace-side-block">
          <div class="workspace-side-label"><i data-lucide="clock"></i><span>Local Time</span></div>
          <div class="workspace-side-text">${escapeHTML(data.localTime || 'Unknown')}<span class="workspace-side-subtext">${escapeHTML(data.timezone || '')}</span></div>
        </div>
        <div class="workspace-side-block">
          <div class="workspace-side-label"><i data-lucide="phone-forwarded"></i><span>Contact Attempts</span></div>
          <div class="workspace-side-text">Not tracked in this view yet<span class="workspace-side-subtext">Call history and outreach attempts can be added next.</span></div>
        </div>
      </div>`;
    window.lucide?.createIcons?.();
  }

  function renderActivity(data) {
    if (!activity) return;
    if (!data.crmId) {
      activity.innerHTML = '<div class="workspace-card-head"><i data-lucide="history"></i><h2>Recent Activity</h2></div><div class="workspace-empty-copy">Select a lead to view recent outreach activity.</div>';
      window.lucide?.createIcons?.();
      return;
    }
    const items = [
      { icon:'notebook-pen', title:'CRM notes', copy:data.notes || 'No CRM notes added yet.' }
    ];
    activity.innerHTML = `
      <div class="workspace-card-head"><i data-lucide="history"></i><h2>Recent Activity</h2></div>
      <ul class="workspace-activity-list">${items.map(item => `
        <li class="workspace-activity-item">
          <div class="workspace-activity-dot"><i data-lucide="${item.icon}"></i></div>
          <div>
            <p class="workspace-activity-title">${escapeHTML(item.title)}</p>
            <p class="workspace-activity-copy">${escapeHTML(item.copy)}</p>
          </div>
        </li>`).join('')}</ul>`;
    window.lucide?.createIcons?.();
  }

  function renderQuickNotes(data) {
    if (!quickNotes) return;
    if (!data.crmId) {
      notesLeadId='';
      quickNotes.innerHTML = '<div class="workspace-card-head"><i data-lucide="notebook-pen"></i><h2>Quick Notes</h2></div><div class="workspace-empty-copy">Select a lead to edit CRM notes.</div>';
      window.lucide?.createIcons?.();
      return;
    }
    // Do not clear someone's unsaved typing during normal lead-card DOM refresh.
    if(notesLeadId === data.crmId && quickNotes.querySelector('#workspaceQuickNotesForm')) return;
    notesLeadId=data.crmId;
    notesChanged=false;
    const content=data.notes === 'No notes added yet.' ? '' : (data.notes||'');
    quickNotes.innerHTML = `
      <div class="workspace-card-head"><i data-lucide="notebook-pen"></i><h2>CRM Notes</h2></div>
      <form class="workspace-notes-form" id="workspaceQuickNotesForm">
        <textarea id="workspaceQuickNotesInput" placeholder="Notes for this CRM lead...">${escapeHTML(content)}</textarea>
        <div class="workspace-notes-actions">
          <span id="workspaceNoteStatus" role="status" aria-live="polite"></span>
          <button type="submit" class="workspace-save-note">Save to CRM</button>
        </div>
      </form>`;
    const form=quickNotes.querySelector('form');
    const textarea=form.querySelector('textarea');
    const button=form.querySelector('button[type="submit"]');
    textarea.addEventListener('input',()=>{notesChanged=true;notify('Unsaved changes');});
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(busy) return;
      const activeCard=selected?.querySelector('.lead-card');
      if(activeCard?.dataset.crmId !== data.crmId){notify('Lead changed. Please reopen notes.');return;}
      const client=crm();
      if(!client){notify('CRM connection unavailable. Note was not saved.');return;}
      busy=true;
      button.disabled=true;
      notify('Saving to CRM…');
      try{
        const value=textarea.value.trim();
        const {data:updated,error}=await client.from('crm').update({notes:value}).eq('id',data.crmId).select('id,notes').single();
        if(error) throw error;
        const currentCard=selected?.querySelector('.lead-card');
        if(currentCard?.dataset.crmId===data.crmId){
          const p=currentCard.querySelector('.notes p');
          if(p)p.textContent=updated.notes||'No notes added yet.';
          const recent=activity?.querySelector('.workspace-activity-copy');
          if(recent) recent.textContent=updated.notes||'No CRM notes added yet.';
        }
        notesChanged=false;
        notify('Saved to CRM');
      }catch(err){
        console.warn('CRM note save failed',err);
        notify('Unable to save. Check your permissions and try again.');
      }finally{busy=false;button.disabled=false;}
    });
    window.lucide?.createIcons?.();
  }


  // Demo-only editing for the selected Outreach lead; use the app's existing modal classes.
  function openDemoLeadTool(card, kind){
    const id=card?.dataset.crmId;
    const db=window.SteadyHandsDemo?.data;
    const lead=db?.crm?.find(item=>String(item.id)===String(id));
    if(!lead)return;
    document.querySelector('.app-modal-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='app-modal-overlay';
    const notes=kind==='notes';
    const options=['Broken Site','Outdated Site','Site Removed','Already have a website','Spanish?','Hot Lead','Interested','Call Back','Needs More Info','Skeptical','No Answer','Left Voicemail','Not Interested','Wrong Number','Conversion','Sold'];
    let tags=lead.tags||[];
    if(typeof tags==='string'){try{tags=JSON.parse(tags)}catch{tags=[tags]}}
    const selectedTags=new Set(Array.isArray(tags)?tags:[]);
    const company=card.querySelector('.sh-ref-company-heading h2')?.textContent||lead.company||'Lead';
    overlay.innerHTML=`<div class="app-modal" role="dialog" aria-modal="true" aria-label="${notes?'Notes':'Tags'}">
      <div class="app-modal-head"><h3>${notes?'Notes':'Tags'} — ${escapeHTML(company)}</h3><button type="button" class="app-modal-close" aria-label="Close"><i data-lucide="x"></i></button></div>
      <div class="app-modal-body">${notes?'<p class="modal-help">Add or update notes for this business.</p><textarea class="modal-textarea" id="sh-demo-notes" placeholder="Add a note...">'+escapeHTML(lead.notes||'')+'</textarea>':'<p class="modal-help">Select the tags for this lead.</p><div class="call-tool-tag-picker" style="display:flex;flex-wrap:wrap;gap:8px">'+[...new Set([...options,...selectedTags])].map(tag=>'<button type="button" class="call-tag-choice '+(selectedTags.has(tag)?'selected':'')+'" data-demo-tag="'+escapeHTML(tag)+'" aria-pressed="'+selectedTags.has(tag)+'" style="border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px;background:var(--card,#fff);color:var(--text,#17304d);cursor:pointer">'+escapeHTML(tag)+'</button>').join('')+'</div>'}</div>
      <div class="app-modal-actions"><button class="modal-action" type="button" data-demo-cancel>Cancel</button><button class="modal-action primary" type="button" data-demo-save>Save ${notes?'Notes':'Tags'}</button></div>
    </div>`;
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.querySelector('.app-modal-close').onclick=close;
    overlay.querySelector('[data-demo-cancel]').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    overlay.querySelectorAll('[data-demo-tag]').forEach(btn=>btn.addEventListener('click',()=>{
      const tag=btn.dataset.demoTag;
      if(selectedTags.has(tag))selectedTags.delete(tag);else selectedTags.add(tag);
      btn.classList.toggle('selected',selectedTags.has(tag));
      btn.setAttribute('aria-pressed',String(selectedTags.has(tag)));
      btn.style.background=selectedTags.has(tag)?'#dbeafe':'var(--card,#fff)';
      btn.style.borderColor=selectedTags.has(tag)?'#2563eb':'#cbd5e1';
    }));
    overlay.querySelectorAll('[data-demo-tag].selected').forEach(btn=>{btn.style.background='#dbeafe';btn.style.borderColor='#2563eb'});
    overlay.querySelector('[data-demo-save]').onclick=()=>{
      if(notes){
        const value=overlay.querySelector('#sh-demo-notes').value.trim();lead.notes=value;
        const parts=[card.querySelector('.sh-ref-notes p'),card.querySelector('.notes p'),activity?.querySelector('.workspace-activity-copy')];
        parts.forEach(el=>{if(el)el.textContent=value||'No notes added yet.'});
        const editor=quickNotes?.querySelector('#workspaceQuickNotesInput');if(editor)editor.value=value;
      }else{
        lead.tags=[...selectedTags];
        const area=card.querySelector('.sh-ref-tags');
        if(area)area.innerHTML=lead.tags.map(tag=>'<span class="sh-ref-tag">'+escapeHTML(tag)+'</span>').join('');
      }
      window.SteadyHandsDemo?.save?.();
      close();
    };
    window.lucide?.createIcons?.();
    if(notes)overlay.querySelector('#sh-demo-notes')?.focus();
  }

  let lastEnhancedCard = null;
  function makeShowcase(card){
    if(card.classList.contains('sh-reference-ready')) return;
    const name=text('.lead-title h2',card);
    const contact=text('.lead-title .name',card);
    const phone=text('.contact-line span',card);
    const notes=text('.notes p',card);
    const tagNames=[...card.querySelectorAll('.compact-tag-row .tag')].map(x=>x.textContent.trim()).filter(Boolean);
    const localRaw=text('.selected-local-time',card).replace(/^For them:\s*/i,'')||text('.compact-local-time',card);
    const [local,zone]=localRaw.split('·').map(s=>(s||'').trim());
    const callStatus=text('.call-time-status',card);
    const originalStar=card.querySelector('.star-button');
    const preview=card.querySelector('.preview-link');
    const showcase=document.createElement('div');
    showcase.className='sh-ref-showcase';
    showcase.innerHTML=`
       <div class="sh-ref-heading">
         <div class="sh-ref-company-icon"><i data-lucide="building-2"></i></div>
         <div><div class="sh-ref-company-heading"><h2>${escapeHTML(name)}</h2><div class="sh-ref-tags">${tagNames.map(v=>`<span class="sh-ref-tag">${escapeHTML(v)}</span>`).join('')}</div></div>${contact?`<p class="sh-ref-subtitle">${escapeHTML(contact)}</p>`:''}</div>
         <button class="sh-ref-star" type="button" title="Star this lead" aria-label="Star this lead"><i data-lucide="star"></i></button>
       </div>
       <div class="sh-ref-stat-row">
         <div class="sh-ref-stat"><div class="sh-ref-label"><i data-lucide="user-round"></i> Contact</div><div class="sh-ref-value">${escapeHTML(contact||'Not provided')}</div></div>
         <div class="sh-ref-stat"><div class="sh-ref-label"><i data-lucide="phone"></i> Phone Number</div><div class="sh-ref-value">${escapeHTML(phone||'Not provided')}</div></div>
         <div class="sh-ref-stat"><div class="sh-ref-label"><i data-lucide="clock-3"></i> Local Time</div><div class="sh-ref-value sh-ref-clock">${escapeHTML(local||'Unknown')}</div><div class="sh-ref-small sh-ref-zone">${escapeHTML(zone)}</div></div>
         <div class="sh-ref-stat"><div class="sh-ref-label"><i data-lucide="phone-call"></i> Status</div><div class="sh-ref-status">${escapeHTML(callStatus||'Not available')}</div></div>
       </div>
       <div class="sh-ref-notes"><i data-lucide="notebook-pen"></i><div><h3>Notes</h3><p>${escapeHTML(notes||'No CRM notes added yet.')}</p></div></div>
       <div class="sh-ref-actions">
         <button class="sh-ref-action primary" type="button" data-sh-action="call"><i data-lucide="phone"></i> Open Call Screen</button>
         <button class="sh-ref-action" type="button" data-sh-action="preview"><i data-lucide="external-link"></i> ${preview?'Open Site Preview':'Site Preview'}</button>
         <button class="sh-ref-action" type="button" data-sh-action="templates"><i data-lucide="file-text"></i> Templates</button>
         <button class="sh-ref-action" type="button" data-sh-action="notes"><i data-lucide="notebook-pen"></i> Notes</button>
         <button class="sh-ref-action" type="button" data-sh-action="tags"><i data-lucide="tags"></i> Tags</button>
       </div>`;
    showcase.addEventListener('click',event=>{
      const btn=event.target.closest('[data-sh-action],.sh-ref-star');
      if(!btn)return;
      if(btn.classList.contains('sh-ref-star')){originalStar?.click();return;}
      const action=btn.dataset.shAction;
      if(action==='notes'||action==='tags')openDemoLeadTool(card,action);
      else if(action==='preview'){window.location.href='demo-preview.html';}
      else if(action==='call' && window.SteadyHandsDemo){
        const params=new URLSearchParams({
          company:card.querySelector('.lead-title h2')?.textContent?.trim()||'Demo Business',
          contact:card.querySelector('.lead-title .name')?.textContent?.trim()||'',
          number:'',role:'',preview:'demo-preview.html',
          crm_id:card.dataset.crmId||'',timezone:card.dataset.timezone||''
        });
        window.location.href='call.html?'+params.toString();
      }
      else card.querySelector('.call-btn[data-select-lead]')?.click();
    });
    card.prepend(showcase);
    card.classList.add('sh-reference-ready');
    window.lucide?.createIcons?.();
  }
  function enhanceSelectedCard(){
    const card=selected?.querySelector('.lead-card');
    if(!card){lastEnhancedCard=null;renderCallInfo({});renderActivity({});renderQuickNotes({});return;}
    if(card===lastEnhancedCard)return;
    lastEnhancedCard=card;
    makeShowcase(card);
    const localRaw=text('.selected-local-time',card).replace(/^For them:\s*/i,'')||text('.compact-local-time',card);
    const [localTime,timezone]=localRaw.split('·').map(x=>(x||'').trim());
    const data={crmId:card.dataset.crmId||'',company:text('.lead-title h2',card),contact:text('.lead-title .name',card),phone:text('.contact-line span',card),notes:text('.notes p',card),callStatus:text('.call-time-status',card),localTime,timezone};
    renderCallInfo(data);renderActivity(data);renderQuickNotes(data);
  }

  // Refresh displayed local time without recreating the notes editor.
  function updateSideClock(){
    const card=selected?.querySelector('.lead-card');
    if(!card)return;
    const source=card.querySelector('.selected-local-time')||card.querySelector('.compact-local-time');
    const el=info?.querySelector('.workspace-side-text');
    if(!source||!el)return;
    const raw=source.textContent.replace(/^For them:\s*/i,'').trim();
    const [clock,zone]=raw.split('·').map(v=>(v||'').trim());
    const span=el.querySelector('.workspace-side-subtext');
    el.firstChild && (el.firstChild.textContent=clock||'Unknown');
    if(span)span.textContent=zone;
    const display=card.querySelector('.sh-ref-clock');if(display)display.textContent=clock||'Unknown';
    const zoneDisplay=card.querySelector('.sh-ref-zone');if(zoneDisplay)zoneDisplay.textContent=zone;
  }
  window.setInterval(updateSideClock,30000);

  const observer = new MutationObserver(() => {
    const card=selected?.querySelector('.lead-card');
    if (card && card !== lastEnhancedCard) enhanceSelectedCard();
  });
  if (selected) observer.observe(selected, { childList:true, subtree:true });
  window.addEventListener('DOMContentLoaded', enhanceSelectedCard, { once:true });
  enhanceSelectedCard();
})();
