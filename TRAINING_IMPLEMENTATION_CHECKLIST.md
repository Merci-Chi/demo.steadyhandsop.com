# Steady Hands Outreach — Live Training Implementation Checklist

This is the build checklist for the **Training** page. Use PDFs, optional audio and interactive practice scenarios. **No videos.** Use fictional customer information in demos.

## 1. Welcome to Steady Hands
- [ ] Add finalized company introduction PDF
- [ ] Add optional audio narration (placeholder until recorded)
- [ ] Show pricing: $100 website development, $20/mo standard hosting, $30/mo backend hosting
- [ ] Show business email pricing: $2/mo or $20/year per mailbox
- [ ] Show double-sided business card pricing: 100/$30, 500/$70, 1000/$100; delivery extra
- [ ] Explain the preview, review, purchase, development and launch process
- [ ] Add a short knowledge check and FAQ

## 2. Outreach platform training
- [ ] Add PDF guide and optional audio
- [ ] Practice opening an assigned fictional lead
- [ ] **Practice adding multiple selected leads to a queue**; confirm destination and prevent duplicates
- [ ] Practice recording call outcomes and scheduling follow-ups
- [ ] Practice changing pipeline stages
- [ ] Show a completion checklist, quiz and FAQ

## 3. Sales call training
- [ ] Add PDF with call opening, scripts, objections and voicemail examples
- [ ] Add optional audio sample conversation
- [ ] Simulate regular-phone and Outreach-app calls; never place real calls in training
- [ ] Practice sending a preview and logging outcomes
- [ ] Practice handling a skeptical prospect
- [ ] Add knowledge check and FAQ

## 4. Client portal / client journey / development handoff
- [ ] Add customer-facing PDF for steadyhandsop.com and the client portal
- [ ] Explain where clients review previews, register, sign agreements and pay
- [ ] Explain where to order business email and business cards
- [ ] **Practice converting a ready-to-buy prospect into a client**
- [ ] Verify contact details, plan, payment and signed agreement before advancing
- [ ] **Practice transferring the client to the development team**:
  - [ ] Confirm client name, business, contact information
  - [ ] Confirm purchased services and hosting plan
  - [ ] Confirm payment and signed agreement
  - [ ] Confirm preview link and requested revisions
  - [ ] Collect logo, brand colors, photos, text and other assets
  - [ ] Collect domain/access information through an approved secure channel; never expose passwords in demo data
  - [ ] Assign builder / development owner and next deadline
  - [ ] Confirm handoff received and notify the customer of next steps
- [ ] Demonstrate customer navigation using **fictional data** only
- [ ] Add knowledge check and FAQ

## 5. Commissions and expectations
- [ ] Add PDF describing qualified sales and commission lifecycle
- [ ] Use a $30 example commission only where consistent with the current compensation policy
- [ ] Explain Waiting on Payment vs Pending vs Earned
- [ ] Include chargeback/refund handling, professional standards and escalation procedures
- [ ] Add optional audio, quiz and FAQ

## Training page integration
- [ ] Integrate HTML styling with the existing Outreach Training navigation
- [ ] Place a 'Read Guide' PDF link in each section
- [ ] Replace audio placeholders with final audio only when available
- [ ] Add real, permission-aware progress persistence; prototype currently uses browser storage only
- [ ] Make each demo's reset/completion behavior explicit
- [ ] Keep simulated actions isolated from live prospects, calling, payment and development systems
- [ ] Verify mobile layout, keyboard controls and screen-reader labels
- [ ] Test in Safari and on phones before release

## Prototype usage
The standalone `training-preview.html` demonstrates layout and interactions, including:
1. Add selected leads to a queue
2. Complete a call and set a follow-up
3. Handle a skeptical prospect
4. Convert a sale to a client
5. Submit a development handoff
6. Guide a customer through the client portal

**Prototype limitations:** The buttons simulate training actions. They do not change your production database or queue, transmit customer messages, or transfer work to development. PDF and audio controls are placeholders.
