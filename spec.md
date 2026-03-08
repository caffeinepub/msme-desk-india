# MSME Desk India

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add

**Authentication**
- User sign up / login via email + password (Internet Identity as underlying auth)
- Admin role with master login credentials stored in backend
- Role-based access: regular user vs admin

**Business Profile Module**
- Post-signup onboarding form collecting: Business Name, Address, Phone, Email, GSTIN, PAN, IEC Code, MSME/Udyam Number, Bank Details (bank name, account no, IFSC, branch), Authorized Signatory name/designation, logo upload, digital signature upload
- Profile stored per user; auto-fills into all generated documents

**Document Generator Module**
- 19 document templates across 3 categories:
  - Trade Documents: Proforma Invoice, Commercial Invoice, Packing List, Sales Order, Purchase Order, Quotation
  - Export Documents: FCO, SCO, LOI, ICPO, NCNDA, IMFPA, Export Sales Contract
  - Business Agreements: Sales Agreement, Purchase Agreement, Agency Agreement, Commission Agreement, Facilitation Agreement, NDA
- Each document type has a step-by-step questionnaire form
- Generated documents are rendered in-browser (HTML-to-PDF approach) with company logo, profile details, and digital signature auto-inserted
- Download as PDF (browser print-to-PDF) and DOCX (generated via frontend library)
- Document history stored per user

**MSME Government Benefits Finder**
- Questionnaire: industry type, annual turnover, business age, startup registration status, export activity, loan requirements
- Eligibility logic evaluates answers against scheme criteria
- Schemes covered: Startup India, Mudra Loan, CGTMSE, PMEGP, MSME subsidies, Export incentives, State government schemes
- Results page shows eligible schemes with details, requirements, and document checklist
- Download application summary as PDF

**Financial Tools**
- GST Calculator (input amount + GST rate, output CGST/SGST/IGST breakdown)
- Profit Margin Calculator (input cost + selling price, output margin %)
- Export FOB to CIF Calculator (FOB value + freight + insurance = CIF)
- Loan EMI Calculator (principal, interest rate, tenure → monthly EMI)

**CRM Module**
- Customers: name, contact, company, email, phone, GSTIN, notes
- Suppliers: same fields as customers with supplier category
- Orders: link to customer/supplier, items, amount, status, date
- Shipments: order reference, carrier, tracking number, status, dates
- Payments: linked to order, amount, mode, date, status (paid/pending/overdue)

**User Dashboard**
- Summary cards: recent documents count, open orders, scheme eligibility count, CRM contacts
- Recent documents list (last 5)
- Quick access tiles to all modules
- Profile completion indicator

**Admin Dashboard**
- User list with profile details and usage stats
- Document template manager (view/edit template metadata and field definitions)
- Add new document template (name, category, fields JSON)
- Government scheme manager (add/edit schemes, criteria, document checklist)
- Usage analytics: documents generated per day, most used templates, active users

### Modify
- Nothing to modify (new project)

### Remove
- Nothing to remove (new project)

## Implementation Plan

1. Backend (Motoko):
   - User profile store (HashMap keyed by Principal)
   - Business profile store with logo/signature blob IDs
   - Document record store (metadata: type, created date, user)
   - CRM entities: customers, suppliers, orders, shipments, payments
   - Government scheme definitions store (admin editable)
   - Document template definitions store (admin editable)
   - Admin role check (hardcoded admin principal or password)
   - Eligibility calculation logic (pure function on scheme criteria)
   - Analytics aggregation queries

2. Frontend:
   - App shell with sidebar navigation (Dashboard, Documents, Benefits Finder, Financial Tools, CRM, Profile, Admin)
   - Auth flow with login/signup pages
   - Business profile onboarding wizard (shown once after first login)
   - Document generator: template picker → questionnaire form → preview → download
   - PDF generation using browser window.print() with styled print CSS
   - DOCX generation using docx.js library
   - Benefits Finder wizard with results and download
   - Four financial calculators on a single page
   - CRM tabs: Customers, Suppliers, Orders, Shipments, Payments with CRUD
   - Admin dashboard with separate route guard
   - Responsive layout for mobile
