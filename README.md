# PikaWebs · Agency Workspace

A high-performance, dependency-free web workspace and CRM for **PikaWebs** (Web Designing & Digital Marketing Agency). Built with pure HTML5, CSS3, and modern vanilla JavaScript, connected directly to a multi-tab Google Sheets database via Google Apps Script.

---

## ⚡ Core Highlights

1. **Brand Identity & Experience**:
   - Google Gemini / Workspace opening animation with soft breathing blue-indigo-purple ambient aura and sliding progress bar.
   - Clean, Apple-inspired interface typography using *Inter* & *Plus Jakarta Sans*.
   - Responsive design with an Apple-style bottom navigation bar on mobile phones (`max-width: 768px`).

2. **Employee Portal & Security**:
   - Split-hero landing & authentication portal on [`login.html`](file:///c:/Users/Naaz%20Computer/Desktop/client%20hub/login.html).
   - **6-Digit Email OTP Verification**: Automated 10-minute OTP dispatched from `shaikmohamadmushakil@gmail.com` before registration completes.
   - **Salted SHA-256 Password Cryptography**: Passwords are saved as irreversible salted hashes (`sha256$<salt>$<hex>`) in Google Sheets; plain-text passwords never remain stored.
   - **Strict Role-Based Permissions**:
     - **Founder / Admin (`shaikmohamadmushakil@gmail.com`)**: Full access to Overview, Financials/Rates, Clients (Add/Edit), Services (Add/Edit), Projects, Invoices & UPI, Team Chat, Reports/Analytics, and Settings (CSV sync & Security Audit Logs).
     - **Registered Employees (All non-founders)**: Dedicated limited access to **Client Info Viewing**, **Services Viewing**, **Project Details & Project Updating**, and **Team Chat Collaboration**. All financial metrics, Invoicing, Billing, Reports, Settings, and Client modifications are hidden and restricted.
   - Non-founder registrations require 1-click email confirmation from `shaikmohamadmushakil@gmail.com`.
   - **Founder / Admin Security Audit Table**: Live tracking of employee login date, exact IST timestamp, device type, OS, browser, screen dimensions, and timezone stored in `LoginLogs` and displayed in Admin/Settings.

3. **Client, Service & Project Delivery**:
   - Complete client relationship manager mapped to your Google Sheets database.
   - Categorized service catalog (Web Services, SEO, SMM).
   - **Project Deliverables Workspace**: Active milestones tracker showing progress bars (0-100%), target launch dates, assigned teams, and latest work logs. Employees can update project progress and log updates in real-time.
   - **Team Chat Room**: Internal live messaging channel for registered employees and founder to coordinate deliverables.

4. **Invoicing & Payments (Founder Only)**:
   - Dynamic invoice builder with automatic subtotal, tax, and balance calculations.
   - Built-in UPI QR code payment widget (`PAYMET.jpeg`, `6281754353@ptsbi` — Shaik Mushkil).
   - "Mark Fully Paid & Record UTR" workflow: dispatches instant confirmation emails to admin and client, updates Google Sheets, and opens a clean print/PDF view.

---

## 📁 Google Sheets Schema (8 Tabs)

1. **`Employees`**: `Employee ID`, `Full Name`, `Email`, `Role`, `Department`, `Password`, `Status`, `Registered Date`
2. **`Clients`**: `Client ID`, `Client Name`, `Company`, `Domain`, `Contact Person`, `Email`, `Phone`, `Account Manager`, `Category`, `Service Name`, `Status`, `Pricing Model`, `Standard Rate`, `Notes`
3. **`Services`**: `Service ID`, `Category`, `Service Name`, `Pricing Model`, `Standard Rate`, `Billing Frequency`, `Deliverables Description`
4. **`Projects`**: `Project ID`, `Client Company`, `Service Name`, `Category`, `Status`, `Progress`, `Target Date`, `Assigned To`, `Latest Update`, `Updated At`
5. **`TeamChat`**: `Message ID`, `Employee Email`, `Full Name`, `Role`, `Message`, `Timestamp`
6. **`Invoices`**: `Invoice ID`, `Invoice No`, `Client Company`, `Issue Date`, `Due Date`, `Reference`, `Tax Rate`, `Amount Paid`, `Service Name`, `Pricing Model`, `Rate`, `Quantity`, `Total Amount`, `Balance Due`, `Status`
7. **`LoginLogs`**: `Log ID`, `Employee ID`, `Full Name`, `Email`, `Role`, `Login Date`, `Login Time (IST)`, `Device Type`, `OS & Browser`, `Screen & Timezone`
8. **`OTP_Store`**: `Email`, `OTP`, `Expires At`, `Payload JSON`

---

## 🚀 Google Apps Script Deployment

Whenever [`Code.gs`](file:///c:/Users/Naaz%20Computer/Desktop/client%20hub/Code.gs) is modified:

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace the script editor code with the contents of [`Code.gs`](file:///c:/Users/Naaz%20Computer/Desktop/client%20hub/Code.gs) and save (`Ctrl + S`).
3. Click **Deploy → Manage deployments**.
4. Click the **Edit (pencil icon)** on your active Web App deployment.
5. In the **Version** dropdown, select **New version**.
6. Ensure **Who has access** is set to **Anyone**.
7. Click **Deploy**.
