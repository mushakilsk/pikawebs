const SS = SpreadsheetApp.getActiveSpreadsheet();
const ADMIN_EMAIL = "shaikmohamadmushakil@gmail.com";

const HEADERS = {
  Employees: ["Employee ID", "Full Name", "Email", "Role", "Department", "Password", "Status", "Registered Date"],
  Clients: ["Client ID", "Client Name", "Company", "Domain", "Contact Person", "Email", "Phone", "Account Manager", "Category", "Service Name", "Status", "Pricing Model", "Standard Rate", "Notes"],
  Services: ["Service ID", "Category", "Service Name", "Pricing Model", "Standard Rate", "Billing Frequency", "Deliverables Description"],
  Invoices: ["Invoice ID", "Invoice No", "Client Company", "Issue Date", "Due Date", "Reference", "Tax Rate", "Amount Paid", "Service Name", "Pricing Model", "Rate", "Quantity", "Total Amount", "Balance Due", "Status"],
  Projects: ["Project ID", "Client Company", "Service Name", "Category", "Status", "Progress", "Target Date", "Assigned To", "Latest Update", "Updated At"],
  TeamChat: ["Message ID", "Employee Email", "Full Name", "Role", "Message", "Timestamp"],
  LoginLogs: ["Log ID", "Employee ID", "Full Name", "Email", "Role", "Login Date", "Login Time (IST)", "Device Type", "OS & Browser", "Screen & Timezone"],
  OTP_Store: ["Email", "OTP", "Expires At", "Payload JSON"]
};

function getOrCreateSheet(name) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) {
    sheet = SS.insertSheet(name);
    if (HEADERS[name]) sheet.appendRow(HEADERS[name]);
    if (name === "Employees") {
      sheet.appendRow(["EMP-001", "Mushakil Shaik", ADMIN_EMAIL, "Founder / Admin", "Management", hashPassword("Admin@123"), "Active", "2026-11-13"]);
    }
  }
  return sheet;
}

// Salted SHA-256 Password Hashing (Stores as "sha256$<salt>$<hex>")
function hashPassword(plainPassword, customSalt) {
  const salt = customSalt || Utilities.getUuid().replace(/-/g, "").slice(0, 16);
  const rawBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ":" + String(plainPassword),
    Utilities.Charset.UTF_8
  );
  const hex = rawBytes.map(b => ("0" + (b < 0 ? b + 256 : b).toString(16)).slice(-2)).join("");
  return `sha256$${salt}$${hex}`;
}

function verifyPassword(plainPassword, storedValue) {
  const stored = String(storedValue || "");
  if (stored.startsWith("sha256$")) {
    const salt = stored.split("$")[1];
    return hashPassword(plainPassword, salt) === stored;
  }
  return stored === String(plainPassword);
}

// Run this function ONCE from the Apps Script toolbar to encrypt existing passwords in your sheet
function encryptExistingPasswords() {
  const sheet = getOrCreateSheet("Employees");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const currentPwd = String(rows[i][5] || "").trim();
    if (currentPwd && !currentPwd.startsWith("sha256$")) {
      sheet.getRange(i + 1, 6).setValue(hashPassword(currentPwd));
    }
  }
}

function isAdminUser(requesterEmail) {
  const email = String(requesterEmail || "").trim().toLowerCase();
  if (!email) return false;
  if (email === ADMIN_EMAIL) return true;
  const sheet = getOrCreateSheet("Employees");
  const rows = sheet.getDataRange().getValues();
  const emp = rows.slice(1).find(r => String(r[2]).trim().toLowerCase() === email);
  if (!emp) return false;
  const role = String(emp[3] || "").toLowerCase();
  return role.includes("founder") || role.includes("admin");
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "approveEmployee" && params.empId) {
    const sheet = getOrCreateSheet("Employees");
    const rows = sheet.getDataRange().getValues();
    const rowIndex = rows.findIndex((r, idx) => idx > 0 && String(r[0]) === String(params.empId));

    if (rowIndex > -1) {
      sheet.getRange(rowIndex + 1, 7).setValue("Active");
      const empName = rows[rowIndex][1];
      const empEmail = rows[rowIndex][2];

      if (empEmail) {
        MailApp.sendEmail({
          to: empEmail,
          name: "PikaWebs Admin",
          subject: "PikaWebs Workspace Access Approved",
          body: `Hi ${empName},\n\nYour PikaWebs employee account (${params.empId}) has been approved by ${ADMIN_EMAIL}.\nYou now have employee workspace access.\n\nRegards,\nPikaWebs`
        });
      }

      return HtmlService.createHtmlOutput(`
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:460px;margin:60px auto;padding:32px;border-radius:18px;border:1px solid #e5e5ea;text-align:center;">
          <div style="font-size:40px;margin-bottom:12px;">✅</div>
          <h2 style="margin:0 0 8px;color:#1d1d1f;">Employee Approved</h2>
          <p style="color:#515154;font-size:14px;"><strong>${empName}</strong> (${params.empId}) is now <strong>Active</strong> with employee workspace access.</p>
        </div>
      `);
    }
    return HtmlService.createHtmlOutput("<h3>Employee ID not found.</h3>");
  }

  return handleRequest({ action: "syncAll" });
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const payload = JSON.parse(raw);
    return handleRequest(payload);
  } catch (err) {
    return jsonOut({ success: false, message: "Request error: " + err.message });
  }
}

function handleRequest(data) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 1. SEND 6-DIGIT OTP TO EMPLOYEE EMAIL FROM shaikmohamadmushakil@gmail.com
    if (data.action === "sendOtp") {
      const email = String(data.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return jsonOut({ success: false, message: "Please enter a valid work email." });
      }

      const empSheet = getOrCreateSheet("Employees");
      const empRows = empSheet.getDataRange().getValues();
      const exists = empRows.slice(1).some(r => String(r[2]).trim().toLowerCase() === email);
      if (exists) {
        return jsonOut({ success: false, message: "This email is already registered." });
      }

      const safeRole = (email === ADMIN_EMAIL) ? "Founder / Admin" : (data.role === "Admin" ? "Account Manager" : data.role);
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes
      const pendingData = JSON.stringify({
        fullName: data.fullName,
        email: email,
        role: safeRole,
        department: data.department,
        password: data.password
      });

      const otpSheet = getOrCreateSheet("OTP_Store");
      const otpRows = otpSheet.getDataRange().getValues();
      const existingIdx = otpRows.findIndex((r, idx) => idx > 0 && String(r[0]).trim().toLowerCase() === email);

      if (existingIdx > -1) {
        otpSheet.getRange(existingIdx + 1, 1, 1, 4).setValues([[email, otp, expiresAt, pendingData]]);
      } else {
        otpSheet.appendRow([email, otp, expiresAt, pendingData]);
      }

      MailApp.sendEmail({
        to: email,
        name: "PikaWebs Verification",
        replyTo: ADMIN_EMAIL,
        subject: `${otp} is your PikaWebs registration verification code`,
        htmlBody: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;padding:28px;border:1px solid #e5e5ea;border-radius:18px;">
            <p style="font-size:11px;font-weight:700;color:#0071e3;letter-spacing:0.06em;margin:0 0 6px;">PIKAWEBS SECURITY</p>
            <h2 style="margin:0 0 10px;color:#1d1d1f;">Verify your email address</h2>
            <p style="color:#515154;font-size:14px;line-height:1.5;">Hi <strong>${data.fullName}</strong>, enter this 6-digit OTP to complete your PikaWebs employee registration:</p>
            <div style="margin:20px 0;padding:16px;background:#f5f5f7;border-radius:12px;text-align:center;font-size:30px;font-weight:700;letter-spacing:0.22em;color:#1d1d1f;">
              ${otp}
            </div>
            <p style="font-size:12px;color:#86868b;margin:0;">This code expires in 10 minutes. Sent from ${ADMIN_EMAIL}.</p>
          </div>
        `
      });

      return jsonOut({ success: true, message: "6-digit OTP sent to " + email });
    }

    // 2. VERIFY OTP & COMPLETE ENCRYPTED REGISTRATION
    if (data.action === "verifyOtpAndRegister") {
      const email = String(data.email || "").trim().toLowerCase();
      const enteredOtp = String(data.otp || "").trim();
      const otpSheet = getOrCreateSheet("OTP_Store");
      const otpRows = otpSheet.getDataRange().getValues();
      const rowIndex = otpRows.findIndex((r, idx) => idx > 0 && String(r[0]).trim().toLowerCase() === email);

      if (rowIndex === -1) {
        return jsonOut({ success: false, message: "No OTP request found for this email. Click Send OTP first." });
      }

      const storedOtp = String(otpRows[rowIndex][1]).trim();
      const expiresAt = Number(otpRows[rowIndex][2]) || 0;
      const regData = JSON.parse(otpRows[rowIndex][3] || "{}");

      if (Date.now() > expiresAt) {
        return jsonOut({ success: false, message: "OTP has expired. Please request a new code." });
      }
      if (enteredOtp !== storedOtp) {
        return jsonOut({ success: false, message: "Incorrect OTP. Please check your email and try again." });
      }

      otpSheet.deleteRow(rowIndex + 1);

      const empSheet = getOrCreateSheet("Employees");
      const empRows = empSheet.getDataRange().getValues();
      const empId = "EMP-" + String(empRows.length).padStart(3, "0");
      const today = new Date().toISOString().slice(0, 10);
      const isFounder = email === ADMIN_EMAIL;
      const status = isFounder ? "Active" : "Pending";
      const encryptedPwd = hashPassword(regData.password);

      empSheet.appendRow([empId, regData.fullName, email, regData.role, regData.department, encryptedPwd, status, today]);

      if (!isFounder) {
        const webAppUrl = ScriptApp.getService().getUrl();
        const approveLink = `${webAppUrl}?action=approveEmployee&empId=${encodeURIComponent(empId)}`;

        MailApp.sendEmail({
          to: ADMIN_EMAIL,
          subject: `[PikaWebs] OTP Verified · Approve Employee: ${regData.fullName} (${empId})`,
          htmlBody: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;padding:24px;border:1px solid #e5e5ea;border-radius:16px;">
              <h2 style="margin:0 0 10px;color:#1d1d1f;">New Employee Verified Email via OTP</h2>
              <p style="color:#515154;font-size:14px;"><strong>${regData.fullName}</strong> (${email}) verified their email and is awaiting your approval for employee workspace access:</p>
              <table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;">
                <tr><td style="padding:5px 0;color:#86868b;">Employee ID:</td><td><strong>${empId}</strong></td></tr>
                <tr><td style="padding:5px 0;color:#86868b;">Role & Dept:</td><td><strong>${regData.role} · ${regData.department}</strong></td></tr>
              </table>
              <a href="${approveLink}" style="display:inline-block;padding:12px 22px;background:#0071e3;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">
                ✓ Approve Employee Access
              </a>
            </div>
          `
        });
      }

      return jsonOut({
        success: true,
        pendingApproval: !isFounder,
        message: isFounder
          ? "Founder account verified & active."
          : "Email verified! Approval request sent to " + ADMIN_EMAIL + ". You can sign in once approved.",
        user: { employeeId: empId, fullName: regData.fullName, email: email, role: regData.role, department: regData.department }
      });
    }

    // 3. EMPLOYEE LOGIN + RECORD DEVICE & TIMESTAMP LOG
    if (data.action === "login") {
      const sheet = getOrCreateSheet("Employees");
      const rows = sheet.getDataRange().getValues();
      const match = rows.slice(1).find(r =>
        String(r[2]).trim().toLowerCase() === String(data.email || "").trim().toLowerCase() &&
        verifyPassword(data.password || "", r[5])
      );
      if (!match) return jsonOut({ success: false, message: "Invalid email or password." });
      if (String(match[6]).toLowerCase() !== "active") {
        return jsonOut({
          success: false,
          message: "Account status is '" + match[6] + "'. Waiting for confirmation from " + ADMIN_EMAIL
        });
      }

      const logSheet = getOrCreateSheet("LoginLogs");
      const nowObj = new Date();
      const istDate = Utilities.formatDate(nowObj, "Asia/Kolkata", "yyyy-MM-dd");
      const istTime = Utilities.formatDate(nowObj, "Asia/Kolkata", "hh:mm:ss a");
      const dev = data.device || {};
      const logId = "LOG-" + nowObj.getTime().toString().slice(-6);

      logSheet.appendRow([
        logId, match[0], match[1], match[2], match[3], istDate, istTime,
        dev.deviceType || "Desktop / Mobile",
        (dev.os || "Device") + " · " + (dev.browser || "Web"),
        (dev.screen || "Auto") + " (" + (dev.timezone || "Asia/Kolkata") + ")"
      ]);

      const adminFlag = isAdminUser(match[2]);
      return jsonOut({
        success: true,
        user: {
          employeeId: match[0],
          fullName: match[1],
          email: match[2],
          role: match[3],
          department: match[4],
          isAdmin: adminFlag
        }
      });
    }

    // 4. SYNC FULL DATABASE (Projects & Chat for all; Invoices & LoginLogs for Founder only)
    if (data.action === "syncAll") {
      const adminFlag = isAdminUser(data.requesterEmail);
      return jsonOut({
        success: true,
        clients: readClients(),
        services: readServices(),
        projects: readProjects(),
        chatMessages: readChatMessages(),
        invoices: adminFlag ? readInvoices() : [],
        loginLogs: adminFlag ? readLoginLogs() : []
      });
    }

    // 5. UPDATE PROJECT (Available to all registered employees & founder)
    if (data.action === "updateProject") {
      const sheet = getOrCreateSheet("Projects");
      const rows = sheet.getDataRange().getValues();
      const p = data.project || {};
      const nowStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd hh:mm a");
      const rowIndex = rows.findIndex((r, idx) => idx > 0 && String(r[0]) === String(p.id));
      const rowValues = [
        p.id || ("PRJ-" + Date.now().toString().slice(-5)),
        p.clientCompany || "",
        p.serviceName || "",
        p.category || "",
        p.status || "In Progress",
        Number(p.progress) || 0,
        p.targetDate || "",
        p.assignedTo || "",
        p.latestUpdate || "",
        nowStr
      ];

      if (rowIndex > -1) {
        sheet.getRange(rowIndex + 1, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return jsonOut({ success: true, projects: readProjects() });
    }

    // 6. TEAM CHAT: SEND MESSAGE (Available to all registered employees & founder)
    if (data.action === "sendChatMessage") {
      const sheet = getOrCreateSheet("TeamChat");
      const text = String(data.message || "").trim();
      if (!text) return jsonOut({ success: false, message: "Empty message" });

      const nowObj = new Date();
      const istTime = Utilities.formatDate(nowObj, "Asia/Kolkata", "dd MMM, hh:mm a");
      const msgId = "MSG-" + nowObj.getTime().toString().slice(-6);

      sheet.appendRow([
        msgId,
        data.senderEmail || "",
        data.fullName || "Team Member",
        data.role || "Team",
        text,
        istTime
      ]);
      return jsonOut({ success: true, chatMessages: readChatMessages() });
    }

    // 7. TEAM CHAT: GET RECENT MESSAGES
    if (data.action === "getChat") {
      return jsonOut({ success: true, chatMessages: readChatMessages() });
    }

    // 8. ADD OR UPDATE CLIENT (FOUNDER / ADMIN ONLY)
    if (data.action === "saveClient") {
      if (!isAdminUser(data.requesterEmail)) {
        return jsonOut({ success: false, message: "Restricted: Only Founder / Admin can add or modify client records." });
      }

      const sheet = getOrCreateSheet("Clients");
      const rows = sheet.getDataRange().getValues();
      const c = data.client;
      const rowValues = [
        c.id, c.clientName, c.company, c.domain || "", c.contactPerson || "",
        c.email || "", c.phone || "", c.accountManager || "", c.category || "",
        c.serviceType || "", c.status || "Active", c.pricingModel || "",
        Number(c.standardRate) || 0, c.notes || ""
      ];
      const rowIndex = rows.findIndex((r, idx) => idx > 0 && String(r[0]) === String(c.id));

      if (rowIndex > -1) {
        sheet.getRange(rowIndex + 1, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return jsonOut({ success: true });
    }

    // 9. BULK IMPORT CLIENTS (FOUNDER / ADMIN ONLY)
    if (data.action === "replaceClients") {
      if (!isAdminUser(data.requesterEmail)) {
        return jsonOut({ success: false, message: "Restricted: Only Founder / Admin can bulk replace clients." });
      }
      const sheet = getOrCreateSheet("Clients");
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).clearContent();
      }
      const newRows = (data.clients || []).map(c => [
        c.id, c.clientName, c.company, c.domain || "", c.contactPerson || "",
        c.email || "", c.phone || "", c.accountManager || "", c.category || "",
        c.serviceType || "", c.status || "In Review", c.pricingModel || "",
        Number(c.standardRate) || 0, c.notes || ""
      ]);
      if (newRows.length) sheet.getRange(2, 1, newRows.length, 14).setValues(newRows);
      return jsonOut({ success: true });
    }

    // 10. ADD SERVICE (FOUNDER / ADMIN ONLY)
    if (data.action === "addService") {
      if (!isAdminUser(data.requesterEmail)) {
        return jsonOut({ success: false, message: "Restricted: Only Founder / Admin can modify the service catalog." });
      }
      const sheet = getOrCreateSheet("Services");
      const s = data.service;
      sheet.appendRow([
        s.id, s.category, s.serviceName, s.pricingModel,
        Number(s.standardRate) || 0, s.billingFrequency, s.deliverablesDescription || ""
      ]);
      return jsonOut({ success: true });
    }

    // 11. SAVE INVOICE (FOUNDER / ADMIN ONLY)
    if (data.action === "saveInvoice") {
      if (!isAdminUser(data.requesterEmail)) {
        return jsonOut({ success: false, message: "Restricted: Only Founder / Admin can generate or record invoices." });
      }
      const sheet = getOrCreateSheet("Invoices");
      const inv = data.invoice;
      const item = (inv.items && inv.items[0]) || {};
      const sub = (Number(item.rate) || 0) * (Number(item.quantity) || 1);
      const total = sub + (sub * (Number(inv.taxRate) || 0) / 100);
      const paid = Math.min(Number(inv.amountPaid) || 0, total);
      const balance = total - paid;
      const status = balance === 0 ? "Paid" : "Open";

      sheet.appendRow([
        inv.id, inv.invoiceNo, inv.clientCompany, inv.date, inv.due,
        inv.reference || "", Number(inv.taxRate) || 0, paid,
        item.serviceName || "", item.pricingModel || "",
        Number(item.rate) || 0, Number(item.quantity) || 1,
        total, balance, status
      ]);

      if (data.notifyEmail || status === "Paid") {
        const utrLine = inv.transactionId ? `<tr><td style="padding:6px 0;color:#86868b;">UPI Ref / UTR:</td><td><strong>${inv.transactionId}</strong></td></tr>` : "";
        const emailHtml = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:540px;padding:24px;border:1px solid #e5e5ea;border-radius:16px;">
            <p style="font-size:11px;font-weight:700;color:#0071e3;letter-spacing:0.06em;margin:0 0 4px;">PIKAWEBS BILLING & PAYMENT</p>
            <h2 style="margin:0 0 14px;color:#1d1d1f;">Invoice ${inv.invoiceNo} — ${status}</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
              <tr><td style="padding:6px 0;color:#86868b;">Client:</td><td><strong>${inv.clientCompany}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#86868b;">Service:</td><td><strong>${item.serviceName || "—"}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#86868b;">UPI ID:</td><td><strong>6281754353@ptsbi</strong> (Shaik Mushkil)</td></tr>
              ${utrLine}
              <tr><td style="padding:6px 0;color:#86868b;">Amount Paid:</td><td><strong style="color:#248a3d;">₹${paid.toLocaleString("en-IN")}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#86868b;">Balance Due:</td><td><strong>₹${balance.toLocaleString("en-IN")}</strong></td></tr>
            </table>
          </div>
        `;
        MailApp.sendEmail({
          to: ADMIN_EMAIL,
          subject: `[PikaWebs Payment] ${inv.invoiceNo} - ${inv.clientCompany} (₹${paid.toLocaleString("en-IN")} ${status})`,
          htmlBody: emailHtml
        });
        if (inv.clientEmail && inv.clientEmail.includes("@")) {
          MailApp.sendEmail({
            to: inv.clientEmail,
            subject: `Invoice & Payment Receipt ${inv.invoiceNo} · PikaWebs`,
            htmlBody: emailHtml
          });
        }
      }
      return jsonOut({ success: true, status });
    }

    return jsonOut({ success: false, message: "Unknown action" });
  } catch (err) {
    return jsonOut({ success: false, message: err.message });
  } finally {
    lock.releaseLock();
  }
}

function readClients() {
  const sheet = getOrCreateSheet("Clients");
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0] || r[1]).map(r => ({
    id: String(r[0]), clientName: String(r[1]), company: String(r[2]),
    domain: String(r[3]), contactPerson: String(r[4]), email: String(r[5]),
    phone: String(r[6]), accountManager: String(r[7]), category: String(r[8]),
    serviceType: String(r[9]), status: String(r[10]) || "Active",
    pricingModel: String(r[11]), standardRate: Number(r[12]) || 0, notes: String(r[13])
  }));
}

function readServices() {
  const sheet = getOrCreateSheet("Services");
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0] || r[2]).map(r => ({
    id: String(r[0]), category: String(r[1]), serviceName: String(r[2]),
    pricingModel: String(r[3]), standardRate: Number(r[4]) || 0,
    billingFrequency: String(r[5]), deliverablesDescription: String(r[6])
  }));
}

function readProjects() {
  const sheet = getOrCreateSheet("Projects");
  let rows = sheet.getDataRange().getValues();
  const clientSheet = getOrCreateSheet("Clients");
  const cRows = clientSheet.getDataRange().getValues();

  // Map existing project company names
  const existingSet = new Set(
    rows.slice(1).map(r => String(r[1] || "").trim().toLowerCase()).filter(Boolean)
  );

  const newDefaults = [];
  cRows.slice(1).filter(r => r[0] || r[2]).forEach((c, idx) => {
    const clientCompany = String(c[2] || c[1] || "").trim();
    if (clientCompany && !existingSet.has(clientCompany.toLowerCase())) {
      const projId = "PRJ-" + String(rows.length + newDefaults.length).padStart(3, "0");
      const serviceName = String(c[9] || "Business website development");
      const category = String(c[8] || "Web Services");
      const nowStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd hh:mm a");
      newDefaults.push([
        projId,
        clientCompany,
        serviceName,
        category,
        "In Progress",
        55,
        "2026-12-15",
        String(c[7] || "PikaWebs Team"),
        `Active deliverable for ${serviceName}.`,
        nowStr
      ]);
      existingSet.add(clientCompany.toLowerCase());
    }
  });

  if (newDefaults.length > 0) {
    newDefaults.forEach(r => sheet.appendRow(r));
    rows = sheet.getDataRange().getValues();
  }

  return rows.slice(1).filter(r => r[0] || r[1]).map(r => ({
    id: String(r[0]),
    clientCompany: String(r[1]),
    serviceName: String(r[2]),
    category: String(r[3]),
    status: String(r[4]) || "In Progress",
    progress: Number(r[5]) || 0,
    targetDate: formatDateCell(r[6]),
    assignedTo: String(r[7] || "PikaWebs Team"),
    latestUpdate: String(r[8] || ""),
    updatedAt: String(r[9] || "")
  }));
}

function readChatMessages() {
  const sheet = getOrCreateSheet("TeamChat");
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    const nowStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM, hh:mm a");
    const welcomeRow = [
      "MSG-001",
      ADMIN_EMAIL,
      "Mushakil Shaik",
      "Founder / Admin",
      "Welcome to PikaWebs Team Workspace! Registered team members can collaborate, post project notes, and coordinate client deliverables here.",
      nowStr
    ];
    sheet.appendRow(welcomeRow);
    return [{
      id: "MSG-001",
      senderEmail: ADMIN_EMAIL,
      fullName: "Mushakil Shaik",
      role: "Founder / Admin",
      message: welcomeRow[4],
      timestamp: nowStr
    }];
  }

  return rows.slice(1).filter(r => r[0] || r[4]).slice(-60).map(r => ({
    id: String(r[0]),
    senderEmail: String(r[1]),
    fullName: String(r[2]),
    role: String(r[3]),
    message: String(r[4]),
    timestamp: String(r[5])
  }));
}

function readInvoices() {
  const sheet = getOrCreateSheet("Invoices");
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0] || r[1]).map(r => ({
    id: String(r[0]), invoiceNo: String(r[1]), clientCompany: String(r[2]),
    date: formatDateCell(r[3]), due: formatDateCell(r[4]), reference: String(r[5]),
    taxRate: Number(r[6]) || 0, amountPaid: Number(r[7]) || 0,
    items: [{
      serviceName: String(r[8]), pricingModel: String(r[9]),
      rate: Number(r[10]) || 0, quantity: Number(r[11]) || 1, description: ""
    }]
  }));
}

function readLoginLogs() {
  const sheet = getOrCreateSheet("LoginLogs");
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0] || r[2]).reverse().slice(0, 50).map(r => ({
    logId: String(r[0]), employeeId: String(r[1]), fullName: String(r[2]),
    email: String(r[3]), role: String(r[4]), loginDate: formatDateCell(r[5]),
    loginTime: String(r[6]), deviceType: String(r[7]), osBrowser: String(r[8]),
    screenTimezone: String(r[9])
  }));
}

function formatDateCell(val) {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
