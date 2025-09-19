# Security and Compliance Overview

This document summarizes the application security controls and operational practices.

## Authentication & Authorization
- Session tokens: Signed JWT stored in HttpOnly cookies
- Role-based access control with least privilege (L1–L5 hierarchy)
- Unique email enforcement for user accounts

## Data Protection
- Transport security: HTTPS everywhere (TLS 1.2+)
- At-rest: Data stored in Cloudflare D1; access restricted via Cloudflare accounts and bindings
- Backups/retention: Export and snapshot guidance available; automation recommended per org policy

## Input Validation
- GSTIN and PAN format checks on API
- Server-side validation for vendor fields and statuses

## API Security
- Strict CORS allowlist for browser-originated requests
- Security headers: nosniff, no-referrer, frame DENY, permissions-policy
- Rate limiting for mutating requests (POST/PUT/DELETE)

## Auditing & Logging
- Cloudflare Workers logs available via `wrangler tail`
- Important actions should be recorded in an audit trail (planned extension)

## Incident Response
- Rollback available via Cloudflare deployments
- Vendor duplication prevented at DB via unique indexes; conflicts return HTTP 409

## Compliance Notes
- Ensure organization policies are followed for data retention, PII handling, and access reviews
- Configure user provisioning and password policies via admin processes
