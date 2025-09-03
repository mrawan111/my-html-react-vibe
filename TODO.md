# TODO: Router Logo and Auto PDF Export Implementation

## 1. Update Router Interface
- [x] Add logo field to Router interface in useRouters.ts
- [ ] Update database schema (assume logo_url field added to routers table)

## 2. Add Logo Upload in Routers Page
- [x] Add logo upload input in Routers.tsx table
- [x] Implement logo preview and save functionality
- [ ] Store logos in public/logos/ directory

## 3. Modify Voucher Cards for Auto Export
- [ ] Update VoucherCards.tsx to get router logo automatically from selected router
- [ ] Modify handleGenerateVouchers to trigger auto PDF export after generation
- [ ] Remove manual image selection, use router logo instead
- [ ] Add validation to ensure router has logo before export

## 4. Push PDFs to Files Page
- [ ] Make Files.tsx dynamic (use state instead of static data)
- [ ] Add function to add new PDF entries to files list
- [ ] Integrate with voucher generation to push PDFs

## 5. Testing and Followup
- [ ] Test logo upload and display
- [ ] Test auto PDF export on voucher generation
- [ ] Test PDF addition to Files.tsx
- [ ] Verify PDF download and display
