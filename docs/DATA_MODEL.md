# Data Model (aligned to PO & Invoice samples)

## Numbering Formats
- PO: ODI/YYYY-YY/NNNN (e.g., ODI/2025-26/0031)
- Invoice: MF/OI/YY-YY/NN (e.g., MF/OI/25-26/19)

## Core Tables (target ~17)
- users (existing)
- roles (existing)
- sessions (new)
- vendors (new)
- purchase_orders, po_items (new)
- invoices, invoice_items (new)
- payments, payment_applications (new)
- approvals, approval_steps (new)
- document_numbering (new)
- audit_logs (new)
- gst_rates, tds_sections (existing)
- attachments (new)
- settings (new)

## Vendors (from samples)
- company_name, legal_name, gstin, pan, state, state_code, address_lines, contact_person, contact_number, email, business_type, bank fields (optional), status, rating.

## Purchase Orders
- po_number (pattern ODI/YYYY-YY/NNNN), po_date, buyer_gstin, supplier_gstin, shipping_gstin, addresses, terms (payment, delivery), totals (basic, tax, grand).
- po_items: sn, hsn_sac, description, qty, uom, rate, taxable_amount, tax_type (IGST/CGST/SGST), tax_rate, tax_amount, line_total.

## Invoices
- invoice_number, invoice_date, seller_gstin, buyer_gstin, consignee, payment_terms, dispatch/eway fields, totals and amount_in_words.
- invoice_items: similar to po_items.

## Document Numbering
- doc_type, prefix, fy_start_month, seq_current, padding, preview.

## Attachments
- entity_type, entity_id, file_name, mime_type, url, uploaded_by, uploaded_at.

## JSON Field Maps (short)
### Invoice_sample extract (key fields)
{
  "invoice_number": "MF/OI/25-26/19",
  "invoice_date": "2025-08-28",
  "seller_gstin": "09AFNPA6326B1ZR",
  "buyer_state_code": "16",
  "items": [{ "hsn_sac": "84433100", "qty": 21, "uom": "PCS", "rate": 8982.20, "taxable_amount": 188626.20, "tax": { "type": "IGST", "rate": 18, "amount": 33952.72 } }]
}

### PO_sample extract (key fields)
{
  "po_number": "ODI/2025-26/0031",
  "po_date": "2025-06-23",
  "supplier_gstin": "07AADCI9794D1Z8",
  "shipping_gstin": "16AABCP5271G1ZI",
  "items": [{ "hsn_sac": "84433100", "description": "HP Smart Tank 523 AIO with 1 YR Warranty", "qty": 1510, "uom": "Nos", "igst_rate": 18 }]
}
