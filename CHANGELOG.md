# Changelog

## 1.3.0 (2026-09-21)

Aligned the workshop with *Harborline Reference Lab - Use Cases and Journeys (3).pptx* and with the identities that exist in the two tenants.

### Day in the life
- Eight stories in the deck's order: Sofia (corporate new hire), Elena (franchisee user onboarding), Jordan (franchise to managed, and back), Sam (managed-hotel shared kiosk), Sam federated (franchise kiosk, external version), Tom (vendor contract ended), Nadia (remote contractor), Kwame (termination).
- New personas Elena Petrova and the federated Sam Okoro, wired through every module (data, architecture moment cases, user moments, demo guide, company playbook, journey narrative, AI guide, highlights).
- Nadia Haddad moved from the partner journey into the day in the life as story 7.
- Headlines, roles and intros follow the deck slides.

### Partner journeys
- Vendor journey is now Tom Reilly of ClimateWorks HVAC (the same identity as story 6 and the Supplier Desk account).
- Franchise journey is now Elena Petrova of Bayside Hotels LLC (the same identity as story 2 and the Franchise Hub account).
- Partner developer journey is now Evan Torres of Tidewater Channel Systems, an External ID account that exists in the tenant.
- Customer loyalty journey removed: the client does not run a rewards programme. `loyalty.js`, `loyalty.css` and the Rewards portal link are gone.

### Validation
- `scripts/validate.mjs` expects eight personas.
- Unused portraits removed; Elena reuses a portrait file under her own name.
