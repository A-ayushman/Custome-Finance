# FAQ

Q: Who has access to approve vendors?
A: L3 (Admin) and above. L4/L5 can override where necessary.

Q: I see "GSTIN already exists" when adding a vendor.
A: GSTIN must be unique. Edit the existing vendor or use a different GSTIN.

Q: CSV import failed. What should I check?
A: Verify required columns, status values, and GSTIN/PAN formats. See CSV_Specs.md.

Q: What is the API base URL?
A: Production: https://api.odicinternational.com (staging: https://api-staging.odicinternational.com)

Q: How to export vendor data?
A: Use Export in the UI or GET /api/vendors/export.csv
