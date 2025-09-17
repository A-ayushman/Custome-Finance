# API Reference (Phase 1)

Base URL: value of <meta name="api-base-url"> (prod)

## Health
GET /api/health -> { status, version, timestamp }

## Vendors (planned)
- GET /api/vendors?page=&size=&search=&status=
- POST /api/vendors { ...vendor_payload }
- GET /api/vendors/:id
- PUT /api/vendors/:id { ...fields }

### Vendor Schema (planned)
{
  "id": 1,
  "company_name": "string",
  "gstin": "string",
  "pan": "string",
  "state": "string",
  "pin_code": "string",
  "business_type": "Service Provider|Distributor|Trader|OEM|Manufacturer",
  "status": "pending|approved|rejected|suspended",
  "rating": 0,
  "created_at": "ISO-8601"
}
