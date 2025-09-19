# Process Flows (Summary)

## Vendor Onboarding
1. User creates vendor (status: Pending)
2. Admin reviews, updates details, approves (status: Approved)
3. Vendor appears in lists and can be used for POs/invoices

## Purchase Order (PO) (Planned)
1. User drafts PO
2. Admin reviews and approves
3. PO issued to vendor

## Invoice & Payment (Planned)
1. Vendor issues invoice
2. Admin validates GST/TDS
3. Payment executed by Payee (L1)

## CSV Import
1. User uploads CSV
2. System validates, upserts by GSTIN
3. Results: inserted/updated/skipped with errors

## Exceptions
- Duplicate GSTIN → HTTP 409
- Invalid formats → HTTP 400 with message
