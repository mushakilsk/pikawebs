const GOOGLE_SCRIPT_URL = window.CLIENT_HUB_CONFIG?.GOOGLE_SCRIPT_URL || "";

// 1. Employee Session Guard
const currentSession = JSON.parse(localStorage.getItem("client-hub-session") || "null");
if (!currentSession) {
  window.location.href = "login.html";
}

const SERVICE_CATALOG_MAP = {
  "Web Services": [
    "Business website development",
    "Landing page design",
    "Ui/Ux design",
    "Website redesign & maintenance"
  ],
  "SEO": [
    "On & Off page seo",
    "Website auditing",
    "LEAD Generation",
    "G-Ads(Google Ads Campaigns)"
  ],
  "SMM": [
    "META ADS",
    "INSTAGRAM & FB MARKETING"
  ]
};

const DEFAULT_SERVICES = [
  { id: "s_web_1", category: "Web Services", serviceName: "Business website development", pricingModel: "One-time project fee", standardRate: 45000, billingFrequency: "Per Project", deliverablesDescription: "Full responsive multi-page business website development, CMS integration, speed optimization, and launch support." },
  { id: "s_web_2", category: "Web Services", serviceName: "Landing page design", pricingModel: "One-time project fee", standardRate: 25000, billingFrequency: "Per Project", deliverablesDescription: "High-converting single-page landing page design, persuasive copywriting structure, and responsive deployment." },
  { id: "s_web_3", category: "Web Services", serviceName: "Ui/Ux design", pricingModel: "Package rate", standardRate: 30000, billingFrequency: "Per Project", deliverablesDescription: "User research, wireframing, high-fidelity UI design, component systems, and interactive Figma prototypes." },
  { id: "s_web_4", category: "Web Services", serviceName: "Website redesign & maintenance", pricingModel: "Monthly Retainer", standardRate: 15000, billingFrequency: "Monthly", deliverablesDescription: "Routine updates, security monitoring, backups, bug fixes, performance tuning, and continuous UI maintenance." },
  { id: "s_seo_1", category: "SEO", serviceName: "On & Off page seo", pricingModel: "Monthly Retainer", standardRate: 20000, billingFrequency: "Monthly", deliverablesDescription: "Keyword research, meta tag optimizations, technical SEO fixes, high-authority backlink building, and monthly ranking reports." },
  { id: "s_seo_2", category: "SEO", serviceName: "Website auditing", pricingModel: "One-time project fee", standardRate: 12000, billingFrequency: "Per Project", deliverablesDescription: "Comprehensive site audit covering crawl errors, Core Web Vitals, mobile UX, indexing issues, and actionable remediation roadmap." },
  { id: "s_seo_3", category: "SEO", serviceName: "LEAD Generation", pricingModel: "Monthly Retainer", standardRate: 35000, billingFrequency: "Monthly", deliverablesDescription: "Multi-channel B2B/B2C lead generation funnels, lead magnets, conversion rate optimization, pipeline qualification, and CRM routing." },
  { id: "s_seo_4", category: "SEO", serviceName: "G-Ads(Google Ads Campaigns)", pricingModel: "Monthly Retainer", standardRate: 25000, billingFrequency: "Monthly", deliverablesDescription: "Search, display, and Performance Max campaign setup, ad copy copywriting, negative keyword pruning, and ROI conversion tracking." },
  { id: "s_smm_1", category: "SMM", serviceName: "META ADS", pricingModel: "Monthly Retainer", standardRate: 25000, billingFrequency: "Monthly", deliverablesDescription: "Meta Ads management across Facebook & Instagram, custom audience targeting, creative split testing, and ROAS optimization." },
  { id: "s_smm_2", category: "SMM", serviceName: "INSTAGRAM & FB MARKETING", pricingModel: "Monthly Retainer", standardRate: 20000, billingFrequency: "Monthly", deliverablesDescription: "Organic social media management, content calendar, graphic/reel curation, active community management, and growth analytics." }
];

const STATUSES = ["Active", "Onboarding", "In Review", "Paused", "Churned"];
const STORE = "client-hub-workbook-v4";
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const copy = x => JSON.parse(JSON.stringify(x));
const iso = d => new Date(d).toISOString().slice(0, 10);
const now = iso(new Date()), due = iso(Date.now() + 30 * 86400000);

const sample = {
  clients: [
    {
      id: "c1",
      clientName: "Tech Force",
      company: "Tech Force Innovations",
      domain: "",
      contactPerson: "Aleem Basha",
      email: "",
      phone: "+91 82972 62786",
      accountManager: "Aleem Basha",
      category: "Web Services",
      serviceType: "Landing page design",
      status: "In Review",
      pricingModel: "One-time project fee",
      standardRate: 25000,
      notes: "Synced from Google Sheets database."
    }
  ],
  services: copy(DEFAULT_SERVICES),
  invoices: [
    {
      id: "i1",
      invoiceNo: "INV-2026-0142",
      clientCompany: "Tech Force Innovations",
      date: "2026-11-13",
      due: "2026-12-13",
      reference: "PO-99201",
      taxRate: 0,
      amountPaid: 0,
      items: [
        {
          serviceName: "Landing page design",
          pricingModel: "One-time project fee",
          rate: 25000,
          quantity: 1,
          description: "High-converting single-page landing page design, persuasive copywriting structure, and responsive deployment."
        }
      ]
    }
  ],
  activity: [
    { icon: "✓", text: "Signed in to PikaWebs workspace", time: "Just now" }
  ],
  projects: [
    {
      id: "PRJ-001",
      clientCompany: "Tech Force Innovations",
      clientName: "Tech Force",
      serviceName: "Landing page design",
      category: "Web Services",
      status: "In Progress",
      progress: 60,
      targetDate: "2026-11-28",
      assignedTo: "Aleem Basha",
      latestUpdate: "Design layout approved by client. Responsive HTML & CTA conversion tracking in progress.",
      updatedAt: "Today, 11:30 AM",
      contactPerson: "Aleem Basha",
      phone: "+91 82972 62786",
      email: ""
    }
  ],
  chatMessages: [
    {
      id: "MSG-001",
      senderEmail: "shaikmohamadmushakil@gmail.com",
      fullName: "Mushakil Shaik",
      role: "Founder / Admin",
      message: "Welcome to PikaWebs workspace! Registered team members can coordinate client projects and post deliverable updates here.",
      timestamp: "Today, 09:00 AM"
    }
  ],
  loginLogs: []
};

let state;
try {
  const saved = JSON.parse(localStorage.getItem(STORE));
  state = saved && typeof saved === "object" ? saved : copy(sample);
} catch {
  state = copy(sample);
}

// Ensure arrays always exist so UI never crashes
if (!Array.isArray(state.clients)) state.clients = copy(sample.clients);
if (!Array.isArray(state.services) || !state.services.length) state.services = copy(DEFAULT_SERVICES);
if (!Array.isArray(state.projects)) state.projects = copy(sample.projects);
if (!Array.isArray(state.chatMessages)) state.chatMessages = copy(sample.chatMessages);
if (!Array.isArray(state.invoices)) state.invoices = copy(sample.invoices);
if (!Array.isArray(state.activity)) state.activity = copy(sample.activity);
if (!Array.isArray(state.loginLogs)) state.loginLogs = [];

// Dynamically align projects with real clients and prune stale dummy sample data
function syncProjectsWithRealClients() {
  if (!Array.isArray(state.clients) || !state.clients.length) return;

  const existingMap = new Map();
  (state.projects || []).forEach(p => {
    if (p.id) existingMap.set(String(p.id).toLowerCase(), p);
    if (p.clientCompany) existingMap.set(String(p.clientCompany).toLowerCase().trim(), p);
    if (p.clientName) existingMap.set(String(p.clientName).toLowerCase().trim(), p);
  });

  const updatedProjects = state.clients.map((c, idx) => {
    const comp = (c.company || c.clientName || `Client ${idx + 1}`).trim();
    const key = comp.toLowerCase();
    const existing = existingMap.get(key) || (c.id ? existingMap.get(String(c.id).toLowerCase()) : null);

    const serviceName = c.serviceType || c.serviceName || "Business website development";
    const category = c.category || "Web Services";
    const assigned = c.accountManager || "PikaWebs Operations Team";

    let defaultProgress = 50;
    let defaultStatus = "In Progress";
    if (c.status === "Active") { defaultProgress = 65; defaultStatus = "In Progress"; }
    else if (c.status === "In Review") { defaultProgress = 85; defaultStatus = "Under Review"; }
    else if (c.status === "Onboarding") { defaultProgress = 20; defaultStatus = "Pending Client Assets"; }
    else if (c.status === "Paused") { defaultProgress = 40; defaultStatus = "On Hold"; }
    else if (c.status === "Churned") { defaultProgress = 100; defaultStatus = "Completed"; }

    return {
      id: existing?.id || c.id || `PRJ-${String(idx + 1).padStart(3, "0")}`,
      clientId: c.id || `c${idx + 1}`,
      clientCompany: comp,
      clientName: c.clientName || comp,
      serviceName: existing?.serviceName || serviceName,
      category: existing?.category || category,
      status: existing?.status || defaultStatus,
      progress: existing?.progress !== undefined ? Number(existing.progress) : defaultProgress,
      targetDate: existing?.targetDate || (c.status === "Active" ? "2026-11-30" : "2026-12-15"),
      assignedTo: existing?.assignedTo || assigned,
      latestUpdate: existing?.latestUpdate || `Client onboarded for ${serviceName}. Active deliverables in progress.`,
      updatedAt: existing?.updatedAt || "Active client deliverable",
      contactPerson: c.contactPerson || "",
      phone: c.phone || "",
      email: c.email || ""
    };
  });

  state.projects = updatedProjects;
}

syncProjectsWithRealClients();

let formType = "client", editingClientId = null, draft = makeDraft(), activeCategoryFilter = "All";

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
  } catch (e) {
    console.warn("Local storage save failed:", e);
  }
}

async function sheetApi(payload) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) return null;
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        requesterEmail: currentSession?.email || "",
        ...payload
      })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      if (text.includes("Script function not found")) {
        console.warn("Apps Script deployment is out of date: 'doPost' was not found.");
      }
      return null;
    }
  } catch (err) {
    console.warn("Google Sheets sync warning:", err);
    return null;
  }
}

async function syncFromGoogleSheets() {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
    finishSplash();
    return;
  }
  const syncBtn = document.querySelector("#syncBtn");
  const syncGasBtn = document.querySelector("#syncGasBtn");
  if (syncBtn) syncBtn.classList.add("spinning");
  if (syncGasBtn) {
    syncGasBtn.textContent = "Syncing…";
    syncGasBtn.disabled = true;
  }
  try {
    const data = await sheetApi({ action: "syncAll" });
    if (data && data.success) {
      if (Array.isArray(data.clients) && data.clients.length) state.clients = data.clients;
      if (Array.isArray(data.services) && data.services.length) state.services = data.services;
      if (Array.isArray(data.projects) && data.projects.length) state.projects = data.projects;
      if (Array.isArray(data.chatMessages) && data.chatMessages.length) state.chatMessages = data.chatMessages;
      if (Array.isArray(data.invoices) && data.invoices.length) state.invoices = data.invoices;
      if (Array.isArray(data.loginLogs)) state.loginLogs = data.loginLogs;
      syncProjectsWithRealClients();
      save();
      draft = makeDraft(draft.clientCompany || state.clients[0]?.company || "");
      render();
      toast("Synced with Google Sheets");
    } else {
      toast("Sync failed: " + (data?.message || "Check connection"));
    }
  } catch (err) {
    console.warn("Sync error:", err);
    toast("Sync error: " + err.message);
  } finally {
    if (syncBtn) syncBtn.classList.remove("spinning");
    if (syncGasBtn) {
      syncGasBtn.textContent = "⟳ Sync full database";
      syncGasBtn.disabled = false;
    }
    finishSplash();
  }
}

function esc(s = "") {
  return String(s ?? "").replace(/[&<>'"]/g, x => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[x]);
}

function initials(s = "") {
  return String(s || "").split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase() || "AM";
}

function cash(v = 0) {
  return inr.format(+v || 0);
}

function cls(s = "") {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function displayDate(s) {
  if (!s) return "—";
  const d = new Date(`${String(s).slice(0, 10)}T00:00:00`);
  return isNaN(d.getTime()) ? String(s) : dateFmt.format(d);
}

function getService(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  return state.services.find(s => (s.serviceName || "").trim().toLowerCase() === n) || null;
}

function client(company) {
  return state.clients.find(c => c.company === company);
}

function resolved(c) {
  if (!c) return { clientName: "", company: "", category: "—", pricingModel: "—", standardRate: 0, status: "Active" };
  let s = getService(c.serviceType);
  return {
    ...c,
    category: c.category || s?.category || "—",
    pricingModel: s?.pricingModel || c.pricingModel || "—",
    standardRate: +(c.standardRate ?? s?.standardRate) || 0
  };
}

function active() {
  return state.clients.filter(c => c.status === "Active").length;
}

function portfolio() {
  return state.clients.reduce((n, c) => n + resolved(c).standardRate, 0);
}

function avg() {
  return state.clients.length ? portfolio() / state.clients.length : 0;
}

function lines(company) {
  let c = client(company), s = c && getService(c.serviceType);
  let rate = +(c?.standardRate ?? s?.standardRate) || 0;
  return c && c.serviceType ? [{
    serviceName: c.serviceType,
    pricingModel: s?.pricingModel || c.pricingModel || "Standard",
    rate,
    quantity: 1,
    description: s?.deliverablesDescription || ""
  }] : [];
}

function totals(inv) {
  let sub = (inv.items || []).reduce((n, i) => n + (+i.rate || 0) * (+i.quantity || 0), 0);
  let tax = sub * (+inv.taxRate || 0) / 100;
  let total = sub + tax;
  let paid = Math.min(+inv.amountPaid || 0, total);
  return { sub, tax, total, paid, balance: total - paid };
}

function outstanding() {
  return state.invoices.reduce((n, i) => n + totals(i).balance, 0);
}

function invoiceNo() {
  return `INV-${new Date().getFullYear()}-${String(142 + state.invoices.length).padStart(4, "0")}`;
}

function makeDraft(companyName = state.clients[0]?.company || "") {
  return {
    invoiceNo: invoiceNo(),
    clientCompany: companyName,
    date: now,
    due,
    reference: "",
    taxRate: 0,
    amountPaid: 0
  };
}

function log(icon, text) {
  state.activity.unshift({ icon, text, time: "Just now" });
  state.activity = state.activity.slice(0, 6);
}

function bars(target, entries, suffix) {
  let max = Math.max(...entries.map(x => x[1]), 1);
  document.querySelector(target).innerHTML = entries.filter(x => x[1]).map(([name, count]) => `
    <div class="break-row">
      <span>${esc(name)}</span>
      <div class="track"><div class="bar" style="width:${count / max * 100}%"></div></div>
      <b>${count} ${suffix}</b>
    </div>
  `).join("") || `<p style="padding:16px 0;color:#7692ad;font-size:12px">No records to show.</p>`;
}

function overview() {
  document.querySelector("#today").textContent = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", month: "long", day: "numeric"
  }).format(new Date()).toUpperCase();

  let cards = [
    ["◉", "#e0f2fe", "#0284c7", "Total clients", state.clients.length, "Sheets synced"],
    ["✓", "#ecfdf5", "#047857", "Active accounts", active(), "Status: Active"],
    ["◇", "#f0f9ff", "#0369a1", "Portfolio value", cash(portfolio()), "Standard rates"],
    ["▤", "#e0f2fe", "#0284c7", "Average rate", cash(avg()), "Across clients"]
  ];

  document.querySelector("#metrics").innerHTML = cards.map(c => `
    <article class="metric">
      <span class="metric-icon" style="background:${c[1]};color:${c[2]}">${c[0]}</span>
      <p class="eyebrow">${c[3].toUpperCase()}</p>
      <h2>${c[4]}</h2>
      <div class="metric-foot"><b class="mapped">Google Sheets DB</b><span>${c[5]}</span></div>
    </article>
  `).join("");

  document.querySelector("#portfolioValue").textContent = cash(portfolio());
  document.querySelector("#activity").innerHTML = state.activity.map(a => `
    <li><i>${a.icon}</i><span>${a.text}</span><time>${a.time}</time></li>
  `).join("");

  bars("#statusBars", STATUSES.map(s => [s, state.clients.filter(c => c.status === s).length]), "client");
  bars("#serviceBars", state.services.map(s => [s.serviceName, state.clients.filter(c => (c.serviceType || "").toLowerCase() === s.serviceName.toLowerCase()).length]), "assigned");
}

function clients() {
  let filter = document.querySelector("#statusFilter"), old = filter.value;
  filter.innerHTML = `<option value="all">All statuses</option>${STATUSES.map(s => `<option ${s === old ? "selected" : ""}>${s}</option>`).join("")}`;
  filterClients();
  document.querySelector("#navClients").textContent = state.clients.length;
}

function filterClients() {
  const admin = isFounderOrAdmin();
  let term = document.querySelector("#clientSearch").value.toLowerCase().trim();
  let status = document.querySelector("#statusFilter").value;
  let list = state.clients.map(resolved).filter(c =>
    (status === "all" || c.status === status) &&
    (!term || [c.clientName, c.company, c.contactPerson, c.email, c.category, c.serviceType, c.status].join(" ").toLowerCase().includes(term))
  );

  const theadTr = document.querySelector("#clients thead tr");
  if (theadTr) {
    theadTr.innerHTML = admin
      ? `<th>CLIENT</th><th>COMPANY</th><th>CONTACT PERSON</th><th>SERVICE & CATEGORY</th><th>STATUS</th><th>STANDARD RATE</th><th></th>`
      : `<th>CLIENT</th><th>COMPANY</th><th>CONTACT PERSON</th><th>SERVICE ASSIGNED</th><th>STATUS</th><th>CONTACT INFO</th><th></th>`;
  }

  document.querySelector("#clientRows").innerHTML = list.map(c => `
    <tr data-client="${c.id}">
      <td><span class="client"><i class="tiny-avatar">${initials(c.clientName)}</i><span><strong>${esc(c.clientName)}</strong><small>${esc(c.domain || "No domain")}</small></span></span></td>
      <td>${esc(c.company)}</td>
      <td>${esc(c.contactPerson || "—")}</td>
      <td>
        <strong>${esc(c.serviceType || "—")}</strong>
        ${c.category && c.category !== "—" ? `<br><small style="color:#43607d">${esc(c.category)}</small>` : ""}
      </td>
      <td><span class="pill ${cls(c.status)}">${esc(c.status)}</span></td>
      ${admin ? `<td>${cash(c.standardRate)}</td>` : `<td><small style="color:#64748b;">${esc(c.email || c.phone || "On file")}</small></td>`}
      <td>
        ${admin
          ? `<button type="button" class="button secondary small" data-edit-client="${c.id}">✎ Edit</button>`
          : `<button type="button" class="button secondary small" data-client="${c.id}">View info</button>`}
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" style="text-align:center;color:#7692ad">No clients match these filters.</td></tr>`;

  document.querySelector("#clientCount").textContent = `Showing ${list.length} of ${state.clients.length} clients`;
}

function getCategories() {
  const cats = new Set(Object.keys(SERVICE_CATALOG_MAP));
  state.services.forEach(s => { if (s.category) cats.add(s.category); });
  return Array.from(cats);
}

function services() {
  let assigned = new Set(state.clients.map(c => (c.serviceType || "").toLowerCase()).filter(Boolean));
  let avgRate = state.services.length ? state.services.reduce((n, s) => n + (+s.standardRate || 0), 0) / state.services.length : 0;

  document.querySelector("#serviceStats").innerHTML = [
    ["Catalogued services", state.services.length],
    ["Assigned services", assigned.size],
    ["Average catalog rate", cash(avgRate)]
  ].map(x => `<article class="stat"><span>${x[0].toUpperCase()}</span><strong>${x[1]}</strong></article>`).join("");

  let filteredServices = activeCategoryFilter === "All"
    ? state.services
    : state.services.filter(s => s.category === activeCategoryFilter);

  document.querySelector("#serviceGrid").innerHTML = filteredServices.map(s => `
    <article class="service-card">
      <div class="service-card-top">
        <div>
          <h2>${esc(s.serviceName)}</h2>
          <p class="category">${esc(s.category || "Uncategorised")}</p>
        </div>
        <span class="pill open">${esc(s.pricingModel || "Rate")}</span>
      </div>
      <p class="description">${esc(s.deliverablesDescription || "No deliverables added yet.")}</p>
      <div class="service-footer">
        <strong>${cash(s.standardRate)}</strong>
        <span>${esc(s.billingFrequency || "Not set")}</span>
      </div>
    </article>
  `).join("") || empty("No services found in this category.");
}

function invoices() {
  if (!client(draft.clientCompany) && state.clients.length) draft = makeDraft();
  let select = document.querySelector("#invoiceClient");
  select.innerHTML = state.clients.map(c => `
    <option value="${esc(c.company)}" ${c.company === draft.clientCompany ? "selected" : ""}>${esc(c.company)}</option>
  `).join("") || "<option>Add a client first</option>";

  for (let [id, key] of [["draftNumber", "invoiceNo"], ["invoiceDate", "date"], ["invoiceDue", "due"], ["invoiceNo", "invoiceNo"], ["invoiceRef", "reference"], ["taxRate", "taxRate"], ["amountPaid", "amountPaid"]]) {
    let el = document.querySelector(`#${id}`);
    if (el.tagName !== "H2") el.value = draft[key];
    else el.textContent = draft[key];
  }

  let c = client(draft.clientCompany), items = lines(draft.clientCompany), virtual = { ...draft, items }, t = totals(virtual);
  let isPaid = t.total > 0 && t.balance === 0;

  document.querySelector("#invoiceContact").innerHTML = c ? `
    <strong>${esc(c.company)}</strong><br>
    ${esc(c.contactPerson || "No contact person")}${c.email ? ` · ${esc(c.email)}` : ""}<br>
    ${esc(c.phone || "No phone on file")}<br>
    <span>Account manager: ${esc(c.accountManager || "Unassigned")} · Status: ${esc(c.status)}</span>
  ` : "<strong>Select a client</strong>";

  document.querySelector("#invoiceItems").innerHTML = items.map(i => `
    <div class="item">
      <span><strong>${esc(i.serviceName)}</strong><small>${esc(i.description || "")}</small></span>
      <span class="model">${esc(i.pricingModel || "—")}</span>
      <span>${cash(i.rate)}</span>
      <span class="qty">${i.quantity}</span>
      <strong>${cash(i.rate * i.quantity)}</strong>
    </div>
  `).join("") || `<p style="padding:14px 5px;color:#86868b;font-size:12px">This client has no assigned service yet.</p>`;

  document.querySelector("#invoicePreview").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div>
        <p class="eyebrow">PIKAWEBS TAX INVOICE</p>
        <h2>${esc(draft.invoiceNo)}</h2>
        <p class="preview-label">${esc(c?.company || "Select a client")}</p>
      </div>
      <div style="text-align:right;">
        <span class="pill ${isPaid ? "paid" : "open"}">${isPaid ? "PAID" : "UNPAID"}</span>
        <div class="print-only" style="margin-top:8px;font-size:12px;color:#515154;">
          <strong style="font-size:15px;color:#1d1d1f;">PikaWebs</strong><br>
          Web Designing & Marketing<br>
          Issued: ${displayDate(draft.date)}<br>
          Due Date: ${displayDate(draft.due)}
          ${draft.reference ? `<br>Ref / PO: ${esc(draft.reference)}` : ""}
        </div>
      </div>
    </div>

    ${c ? `
      <div class="print-only" style="margin:14px 0;padding:12px 14px;background:#f5f5f7;border-radius:10px;font-size:12px;color:#515154;">
        <strong style="color:#1d1d1f;font-size:13px;">Bill To: ${esc(c.company)}</strong><br>
        ${c.contactPerson ? `Attn: ${esc(c.contactPerson)}<br>` : ""}
        ${c.email ? `Email: ${esc(c.email)}<br>` : ""}
        ${c.phone ? `Phone: ${esc(c.phone)}` : ""}
      </div>
    ` : ""}

    <div class="print-only" style="margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f5f5f7;border-bottom:1px solid #d2d2d7;">
            <th style="text-align:left;padding:8px 10px;">SERVICE & DELIVERABLES</th>
            <th style="text-align:left;padding:8px 10px;">MODEL</th>
            <th style="text-align:right;padding:8px 10px;">RATE</th>
            <th style="text-align:center;padding:8px 10px;">QTY</th>
            <th style="text-align:right;padding:8px 10px;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr style="border-bottom:1px solid #e5e5ea;">
              <td style="padding:10px;">
                <strong>${esc(i.serviceName)}</strong>
                ${i.description ? `<br><small style="color:#86868b;">${esc(i.description)}</small>` : ""}
              </td>
              <td style="padding:10px;">${esc(i.pricingModel || "—")}</td>
              <td style="padding:10px;text-align:right;">${cash(i.rate)}</td>
              <td style="padding:10px;text-align:center;">${i.quantity}</td>
              <td style="padding:10px;text-align:right;"><strong>${cash(i.rate * i.quantity)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <hr>
    <div class="preview-row"><span>Subtotal</span><strong>${cash(t.sub)}</strong></div>
    <div class="preview-row"><span>Tax (${+draft.taxRate || 0}%)</span><strong>${cash(t.tax)}</strong></div>
    <div class="preview-row total"><span>Total due</span><strong>${cash(t.total)}</strong></div>
    <div class="preview-row"><span>Amount paid</span><strong>${cash(t.paid)}</strong></div>
    <div class="preview-row total"><span>Balance due</span><strong>${cash(t.balance)}</strong></div>
    <hr>

    <!-- UPI QR Code Payment Box -->
    <div class="qr-payment-box" style="margin-top:16px;padding:16px;background:#f5f5f7;border-radius:14px;text-align:center;">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.06em;color:#0071e3;margin-bottom:8px;">SCAN & PAY VIA UPI</p>
      <img src="PAYMET.jpeg" alt="Shaik Mushkil Paytm UPI QR" style="width:190px;max-width:100%;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,0.08);margin:0 auto 10px;display:block;" onerror="this.style.display='none';">
      <p style="font-size:12.5px;font-weight:600;color:#1d1d1f;">Shaik Mushkil · 6281754353@ptsbi</p>
      <p style="font-size:11.5px;color:#86868b;margin-bottom:12px;">Amount to pay: <strong>${cash(t.balance > 0 ? t.balance : t.total)}</strong></p>

      <div class="no-print" style="display:flex;flex-direction:column;gap:8px;">
        <input id="upiRefInput" type="text" placeholder="Enter UPI Ref / UTR No. (optional)" value="${esc(draft.transactionId || "")}" style="padding:9px 12px;border-radius:10px;border:1px solid #d2d2d7;font-size:12.5px;background:#ffffff;text-align:center;">
        <button type="button" id="completePaymentBtn" class="button primary" style="width:100%;justify-content:center;">
          ✓ Complete Payment & Auto-Generate Invoice
        </button>
      </div>
    </div>

    <p class="preview-label" style="margin-top:12px;">Payment terms: Net 30 days · UPI: 6281754353@ptsbi</p>
  `;

  document.querySelector("#invoiceRows").innerHTML = state.invoices.map(i => {
    let q = totals(i);
    let status = q.balance === 0 ? "Paid" : new Date(`${i.due}T23:59:59`) < new Date() ? "Overdue" : "Open";
    return `
      <tr>
        <td><strong style="color:#1d1d1f">${esc(i.invoiceNo)}</strong></td>
        <td>${esc(i.clientCompany)}</td>
        <td>${displayDate(i.date)}</td>
        <td>${displayDate(i.due)}</td>
        <td>${cash(q.total)}</td>
        <td>${cash(q.balance)}</td>
        <td><span class="pill ${cls(status)}">${status}</span></td>
      </tr>
    `;
  }).join("");
}

function reports() {
  document.querySelector("#activeReport").textContent = active();
  document.querySelector("#valueReport").textContent = cash(portfolio());
  document.querySelector("#balanceReport").textContent = cash(outstanding());

  let values = STATUSES.map(s => [s, state.clients.filter(c => c.status === s).reduce((n, c) => n + resolved(c).standardRate, 0)]).filter(x => x[1]);
  let max = Math.max(...values.map(x => x[1]), 1);

  document.querySelector("#reportBars").innerHTML = values.map(([s, v]) => `
    <div class="report-row">
      <span>${esc(s)}</span>
      <div class="track"><div class="bar" style="width:${v / max * 100}%"></div></div>
      <strong>${cash(v)}</strong>
    </div>
  `).join("") || empty("No value is assigned to current client statuses.");
}

function applyRolePermissions() {
  const admin = isFounderOrAdmin();

  // Hide restricted views for non-admin employees (Overview, Invoices, Reports, Settings)
  document.querySelectorAll('[data-view="overview"]').forEach(el => el.style.display = admin ? "" : "none");
  document.querySelectorAll('[data-view="invoices"]').forEach(el => el.style.display = admin ? "" : "none");
  document.querySelectorAll('[data-view="reports"]').forEach(el => el.style.display = admin ? "" : "none");
  document.querySelectorAll('[data-view="settings"]').forEach(el => el.style.display = admin ? "" : "none");

  // Client info, Services, Projects, Chat are visible to employees
  document.querySelectorAll('[data-view="clients"], [data-view="services"], [data-view="projects"], [data-view="chat"]').forEach(el => {
    el.style.display = "";
  });

  // Action buttons: Add client, add service, CSV import/export only for Founder
  document.querySelectorAll('[data-action="add-client"], [data-action="add-service"], [data-action="import"], [data-action="export"]').forEach(el => {
    el.style.display = admin ? "" : "none";
  });

  // Mobile Bottom Bar updates
  renderMobileTabBar(admin);

  // Add role badge next to employee name in sidebar
  const profileRole = document.querySelector(".sidebar-footer .profile small");
  if (profileRole && currentSession) {
    profileRole.textContent = admin
      ? `${currentSession.role} · Full Access`
      : `${currentSession.role} · Team Member`;
  }

  // If a non-admin employee is currently on a restricted view, redirect them to projects or clients
  const activePage = document.querySelector(".page.active");
  if (!admin && activePage && ["overview", "invoices", "reports", "settings"].includes(activePage.id)) {
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === "projects"));
    document.querySelectorAll(".nav, .m-tab").forEach(n => n.classList.toggle("active", n.dataset.view === "projects"));
  }
}

function renderMobileTabBar(admin) {
  const bar = document.querySelector("#mobileTabbar");
  if (!bar) return;
  const currentActive = document.querySelector(".page.active")?.id || (admin ? "overview" : "projects");

  if (admin) {
    bar.innerHTML = `
      <button class="m-tab ${currentActive === "overview" ? "active" : ""}" data-view="overview">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        <span>Overview</span>
      </button>
      <button class="m-tab ${currentActive === "clients" ? "active" : ""}" data-view="clients">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
        <span>Clients</span>
      </button>
      <button class="m-tab ${currentActive === "projects" ? "active" : ""}" data-view="projects">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Projects</span>
      </button>
      <button class="m-tab ${currentActive === "invoices" ? "active" : ""}" data-view="invoices">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>Invoices</span>
      </button>
      <button class="m-tab ${currentActive === "settings" ? "active" : ""}" data-view="settings">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Admin</span>
      </button>
    `;
  } else {
    bar.innerHTML = `
      <button class="m-tab ${currentActive === "projects" ? "active" : ""}" data-view="projects">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Projects</span>
      </button>
      <button class="m-tab ${currentActive === "clients" ? "active" : ""}" data-view="clients">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
        <span>Clients</span>
      </button>
      <button class="m-tab ${currentActive === "services" ? "active" : ""}" data-view="services">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
        <span>Services</span>
      </button>
      <button class="m-tab ${currentActive === "chat" ? "active" : ""}" data-view="chat">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Team Chat</span>
      </button>
    `;
  }
}

let activeProjectFilter = "All";

function projects() {
  const list = state.projects || [];
  const total = list.length;
  const inProgress = list.filter(p => p.status === "In Progress").length;
  const underReview = list.filter(p => p.status === "Under Review").length;
  const completed = list.filter(p => p.status === "Completed").length;

  const totalEl = document.querySelector("#metricTotalProjects");
  if (totalEl) totalEl.textContent = total;
  const inProgEl = document.querySelector("#metricInProgressProjects");
  if (inProgEl) inProgEl.textContent = inProgress;
  const revEl = document.querySelector("#metricReviewProjects");
  if (revEl) revEl.textContent = underReview;
  const compEl = document.querySelector("#metricCompletedProjects");
  if (compEl) compEl.textContent = completed;

  const navProjects = document.querySelector("#navProjects");
  if (navProjects) navProjects.textContent = total;

  const filtered = activeProjectFilter === "All" ? list : list.filter(p => p.status === activeProjectFilter);
  const countLabel = document.querySelector("#projectsCountLabel");
  if (countLabel) countLabel.textContent = `Showing ${filtered.length} of ${total} projects`;

  const grid = document.querySelector("#projectsGrid");
  if (!grid) return;

  grid.innerHTML = filtered.length ? filtered.map(p => {
    const statusCls = p.status === "Completed" ? "active" : p.status === "Under Review" ? "pending" : p.status === "On Hold" ? "neutral" : "open";
    const progColor = p.status === "Completed" ? "#10b981" : p.status === "Under Review" ? "#8b5cf6" : p.status === "On Hold" ? "#f59e0b" : "#0284c7";
    const contactLine = [p.contactPerson, p.phone, p.email].filter(Boolean).join(" · ");
    return `
      <article class="project-card">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <div>
              <p class="eyebrow" style="color:#0284c7;font-size:10.5px;margin-bottom:2px;">${esc(p.category || "SERVICE")}</p>
              <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0;">${esc(p.clientCompany)}</h3>
              <p style="font-size:13px;color:#475569;margin-top:2px;">${esc(p.serviceName)}</p>
            </div>
            <span class="pill ${statusCls}">${esc(p.status)}</span>
          </div>

          ${contactLine ? `
            <div style="font-size:11.5px;color:#64748b;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <span style="font-size:12px;">👤</span><span>${esc(contactLine)}</span>
            </div>
          ` : ""}

          <div class="progress-track" style="margin-top:8px;">
            <div class="progress-fill" style="width:${Math.min(100, Math.max(0, p.progress || 0))}%;background:${progColor};"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11.5px;color:#64748b;margin-bottom:12px;">
            <span>Milestone: <strong style="color:#0f172a;">${p.progress || 0}%</strong></span>
            <span>Target: <strong style="color:#0f172a;">${esc(p.targetDate || "Ongoing")}</strong></span>
          </div>

          <p style="font-size:11.5px;color:#64748b;">
            Assigned: <strong style="color:#334155;">${esc(p.assignedTo || "PikaWebs Operations Team")}</strong>
          </p>

          <div style="background:#f8fafc;padding:10px 12px;border-radius:10px;border:1px solid #e2e8f0;margin-top:12px;">
            <p style="font-size:10px;font-weight:700;letter-spacing:0.05em;color:#0284c7;margin-bottom:2px;">LATEST WORK UPDATE</p>
            <p style="font-size:12px;color:#334155;margin:0;line-height:1.4;">${esc(p.latestUpdate || "Active deliverable in progress.")}</p>
            <small style="font-size:10px;color:#94a3b8;display:block;margin-top:4px;">${esc(p.updatedAt || "")}</small>
          </div>
        </div>

        <button type="button" class="button primary small" data-update-project="${p.id}" style="width:100%;margin-top:14px;">✎ Update Project</button>
      </article>
    `;
  }).join("") : `<div style="grid-column:1/-1;text-align:center;padding:32px;color:#86868b;">No projects in "${activeProjectFilter}" status.</div>`;
}

function openProjectModal(projId) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) return;

  const titleEl = document.querySelector("#projectModalTitle");
  if (titleEl) titleEl.textContent = `Update: ${p.clientCompany}`;

  const form = document.querySelector("#projectUpdateForm");
  if (!form) return;

  form.innerHTML = `
    <input type="hidden" name="id" value="${esc(p.id)}">
    <div class="form-grid">
      <label class="field wide">CLIENT & SERVICE
        <input type="text" value="${esc(p.clientCompany)} · ${esc(p.serviceName)}" readonly style="background:#f1f5f9;color:#64748b;">
      </label>

      <label class="field">PROJECT STATUS
        <select name="status" id="projStatusInput" required>
          <option value="In Progress" ${p.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Under Review" ${p.status === "Under Review" ? "selected" : ""}>Under Review</option>
          <option value="Pending Client Assets" ${p.status === "Pending Client Assets" ? "selected" : ""}>Pending Client Assets</option>
          <option value="Completed" ${p.status === "Completed" ? "selected" : ""}>Completed</option>
          <option value="On Hold" ${p.status === "On Hold" ? "selected" : ""}>On Hold</option>
        </select>
      </label>

      <label class="field">PROGRESS (%)
        <input type="number" name="progress" min="0" max="100" value="${p.progress || 0}" required>
      </label>

      <label class="field">TARGET LAUNCH DATE
        <input type="date" name="targetDate" value="${esc(p.targetDate || "")}">
      </label>

      <label class="field">ASSIGNED TEAM
        <input type="text" name="assignedTo" value="${esc(p.assignedTo || "")}" placeholder="e.g., Aleem / Web Team">
      </label>

      <label class="field wide">LATEST WORK UPDATE / LOG
        <textarea name="latestUpdate" rows="3" required placeholder="Describe milestones completed, client review status, or next steps…">${esc(p.latestUpdate || "")}</textarea>
      </label>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
      <button type="button" class="button secondary" data-close>Cancel</button>
      <button type="submit" class="button primary">Save Project Update ✓</button>
    </div>
  `;

  document.querySelector("#overlay").classList.add("open");
  document.querySelector("#projectModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function chat() {
  const container = document.querySelector("#chatMessagesList");
  if (!container) return;
  const messages = state.chatMessages || [];
  const myEmail = (currentSession?.email || "").toLowerCase();

  const userBadge = document.querySelector("#chatActiveUser");
  if (userBadge && currentSession) {
    userBadge.textContent = `${currentSession.fullName} (${currentSession.role})`;
  }

  container.innerHTML = messages.length ? messages.map(m => {
    const isOwn = (m.senderEmail || "").toLowerCase() === myEmail;
    const isFounder = (m.role || "").toLowerCase().includes("founder") || (m.role || "").toLowerCase().includes("admin");
    const roleBadge = isFounder ? `<span class="pill active" style="font-size:9.5px;padding:1px 6px;">Founder</span>` : `<span class="pill open" style="font-size:9.5px;padding:1px 6px;">${esc(m.role || "Team")}</span>`;

    return `
      <div class="chat-row ${isOwn ? "own" : "other"}">
        <div style="display:flex;flex-direction:column;max-width:100%;">
          <div class="chat-meta">
            ${isOwn ? "" : `<strong>${esc(m.fullName || "Team Member")}</strong>`}
            ${roleBadge}
            <span>${esc(m.timestamp || "")}</span>
          </div>
          <div class="chat-bubble">
            ${esc(m.message)}
          </div>
        </div>
      </div>
    `;
  }).join("") : `<p style="text-align:center;color:#86868b;padding:32px;">No messages yet. Send a message to start team collaboration!</p>`;

  container.scrollTop = container.scrollHeight;
}

function updateProfileUI() {
  const u = currentSession;
  if (!u) return;

  const admin = isFounderOrAdmin();
  const userNameEl = document.querySelector("#sidebarUserName");
  const userRoleEl = document.querySelector("#sidebarUserRole");
  const sidebarAvatar = document.querySelector("#sidebarAvatar");
  const headerAvatar = document.querySelector("#headerAvatar");

  if (userNameEl) userNameEl.textContent = u.fullName || "Team Member";
  if (userRoleEl) {
    userRoleEl.textContent = admin
      ? `${u.role || "Founder"} · Admin`
      : `${u.role || "Team"} · Operations`;
  }

  const ini = initials(u.fullName || "AM");
  if (sidebarAvatar) sidebarAvatar.textContent = ini;
  if (headerAvatar) headerAvatar.textContent = ini;

  applyRolePermissions();
}

function openProfileModal() {
  const u = currentSession;
  if (!u) return;

  const admin = isFounderOrAdmin();
  const initialsText = initials(u.fullName || "User");
  const content = document.querySelector("#profileModalContent");
  if (!content) return;

  const loginTimeText = u.loginTime || (new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + ", Today");
  const device = u.device || {
    deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
    os: navigator.userAgent.includes("Windows") ? "Windows" : navigator.userAgent.includes("Mac") ? "macOS" : "Device",
    browser: navigator.userAgent.includes("Chrome") ? "Google Chrome" : "Web Browser",
    screen: `${window.screen.width}×${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
  };

  content.innerHTML = `
    <div class="user-profile-dialog">
      <!-- Profile Header Hero -->
      <div class="user-profile-hero">
        <div class="user-profile-avatar">${esc(initialsText)}</div>
        <div class="user-profile-intro">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <h2>${esc(u.fullName || "Team Member")}</h2>
            <span class="user-status-pill"><i class="status-dot"></i> Active Account</span>
          </div>
          <p class="user-email-text">${esc(u.email || "")}</p>
          <span class="user-role-badge ${admin ? "founder" : "team"}">
            ${admin ? "👑 Founder / Super Admin" : "🛡️ Team Member · " + esc(u.role || "Operations")}
          </span>
        </div>
      </div>

      <!-- Individual Details Grid -->
      <div class="user-details-section">
        <h3 class="user-section-title">INDIVIDUAL EMPLOYEE DETAILS</h3>
        <div class="user-info-grid">
          <div class="user-info-item">
            <span class="info-label">EMPLOYEE ID</span>
            <strong class="info-val">${esc(u.employeeId || "EMP-001")}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">DEPARTMENT</span>
            <strong class="info-val">${esc(u.department || "Operations & Client Success")}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">ASSIGNED ROLE</span>
            <strong class="info-val">${esc(u.role || "Account Manager")}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">ACCESS LEVEL</span>
            <strong class="info-val" style="color:${admin ? "#0071e3" : "#0284c7"};">${admin ? "Founder / Full Unrestricted" : "Operational (Clients & Projects)"}</strong>
          </div>
        </div>
      </div>

      <!-- Active Session & Security Details -->
      <div class="user-details-section">
        <h3 class="user-section-title">ACTIVE SESSION & DEVICE INFORMATION</h3>
        <div class="user-info-grid">
          <div class="user-info-item">
            <span class="info-label">LOGGED IN TIME</span>
            <strong class="info-val" style="font-size:12px;">${esc(loginTimeText)}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">DEVICE TYPE</span>
            <strong class="info-val">${esc(device.deviceType || "Desktop")}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">OPERATING SYSTEM</span>
            <strong class="info-val">${esc(device.os || "Device OS")}</strong>
          </div>
          <div class="user-info-item">
            <span class="info-label">BROWSER & RESOLUTION</span>
            <strong class="info-val" style="font-size:12px;">${esc(device.browser || "Browser")} (${esc(device.screen || "Screen")})</strong>
          </div>
        </div>
      </div>

      <!-- Scope of Permissions Card -->
      <div class="user-permissions-box ${admin ? "admin-box" : "team-box"}">
        <strong>${admin ? "Founder / Super Administrator Scope" : "Assigned Team Member Scope"}</strong>
        <p>${admin 
          ? "You have full administrator access across all tabs: client directory, service catalog, invoice generation, team chat, employee security audits, and Google Sheets database connections." 
          : "You have verified workspace access to view clients and service deliverables, update project progress, add new client leads, and communicate with the team via Team Chat."}
        </p>
      </div>

      <!-- Actions -->
      <div class="user-profile-actions">
        <button type="button" class="button secondary" data-close>Close</button>
        <button type="button" id="modalSignOutBtn" class="button danger">
          ⎋ Sign Out (${esc(u.fullName || "User")})
        </button>
      </div>
    </div>
  `;

  document.querySelector("#overlay").classList.add("open");
  document.querySelector("#profileModal").classList.add("open");
  document.body.style.overflow = "hidden";

  const signOutBtn = document.querySelector("#modalSignOutBtn");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      localStorage.removeItem("client-hub-session");
      window.location.href = "login.html";
    });
  }
}

function isFounderOrAdmin() {
  if (!currentSession) return false;
  const email = String(currentSession.email || "").trim().toLowerCase();
  const role = String(currentSession.role || "").trim().toLowerCase();
  return email === "shaikmohamadmushakil@gmail.com" || role.includes("founder") || role.includes("admin");
}

function renderAdminLoginLogs() {
  const container = document.getElementById("adminSecuritySection");
  if (!container) return;

  // Hide completely for non-admin employees
  if (!isFounderOrAdmin()) {
    container.innerHTML = "";
    return;
  }

  const logs = state.loginLogs || [];
  container.innerHTML = `
    <article class="panel table-panel">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(0,0,0,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <p class="eyebrow" style="color:#0071e3;">FOUNDER / ADMIN SECURITY AUDIT</p>
          <h2 style="font-size:19px;">Employee Login & Device Activity</h2>
          <p style="font-size:13px;color:#515154;margin-top:2px;">Live log of every team sign-in, timestamp (IST), device type, OS, and browser.</p>
        </div>
        <button type="button" class="button secondary small" id="refreshLogsBtn">↻ Refresh logs</button>
      </div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>ROLE</th>
              <th>DATE & TIME (IST)</th>
              <th>DEVICE</th>
              <th>OS & BROWSER</th>
              <th>SCREEN / TIMEZONE</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length ? logs.map(l => `
              <tr>
                <td>
                  <span class="client">
                    <i class="tiny-avatar">${initials(l.fullName)}</i>
                    <span>
                      <strong>${esc(l.fullName)}</strong>
                      <small>${esc(l.email)}</small>
                    </span>
                  </span>
                </td>
                <td><span class="pill open">${esc(l.role || "Team")}</span></td>
                <td>
                  <strong>${esc(l.loginTime)}</strong><br>
                  <small style="color:#86868b;">${esc(l.loginDate)}</small>
                </td>
                <td><strong>${esc(l.deviceType)}</strong></td>
                <td>${esc(l.osBrowser)}</td>
                <td><small style="color:#515154;">${esc(l.screenTimezone)}</small></td>
              </tr>
            `).join("") : `
              <tr>
                <td colspan="6" style="text-align:center;color:#86868b;padding:24px;">
                  No employee logins recorded yet. Logs appear automatically upon sign-in.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
      <footer>Showing ${logs.length} most recent sign-ins · Visible only to Founder / Admin</footer>
    </article>
  `;
}

function render() {
  updateProfileUI();
  overview();
  clients();
  services();
  projects();
  chat();
  invoices();
  reports();
  renderAdminLoginLogs();
}

function drawer(id) {
  let raw = state.clients.find(x => x.id === id);
  if (!raw) return;
  const admin = isFounderOrAdmin();
  let c = resolved(raw);
  document.querySelector("#drawerContent").innerHTML = `
    <div class="drawer-profile">
      <i class="tiny-avatar">${initials(c.clientName)}</i>
      <div>
        <h2>${esc(c.clientName)}</h2>
        <p>${esc(c.company)}</p>
      </div>
    </div>
    <span class="pill ${cls(c.status)}">${esc(c.status)}</span>
    <div class="drawer-section">
      <h3>CONTACT DETAILS</h3>
      ${detail("Contact person", c.contactPerson)}
      ${detail("Email", c.email)}
      ${detail("Phone", c.phone)}
      ${detail("Domain", c.domain)}
    </div>
    <div class="drawer-section">
      <h3>ACCOUNT & SERVICE</h3>
      ${detail("Account manager", c.accountManager)}
      ${detail("Category", c.category)}
      ${detail("Service name", c.serviceType)}
      ${admin ? detail("Pricing model", c.pricingModel) : ""}
      ${admin ? detail("Standard rate", cash(c.standardRate)) : ""}
    </div>
    ${c.notes ? `
      <div class="drawer-section">
        <h3>NOTES</h3>
        <p style="font-size:13px;color:#43607d">${esc(c.notes)}</p>
      </div>
    ` : ""}
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      ${admin ? `<button class="button secondary" data-edit-client="${esc(c.id)}">✎ Edit details</button>` : ""}
      ${admin ? `<button class="button primary" data-invoice-client="${esc(c.company)}">Create invoice</button>` : ""}
    </div>
  `;
  open("drawer");
}

function detail(k, v) {
  return `<div class="detail"><span>${k}</span><strong>${esc(v || "—")}</strong></div>`;
}

function open(type) {
  document.querySelector("#overlay").classList.add("open");
  document.querySelector(type === "drawer" ? "#drawer" : "#modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function close() {
  document.querySelector("#overlay")?.classList.remove("open");
  document.querySelector("#drawer")?.classList.remove("open");
  document.querySelector("#modal")?.classList.remove("open");
  document.querySelector("#projectModal")?.classList.remove("open");
  document.querySelector("#profileModal")?.classList.remove("open");
  document.querySelector(".sidebar")?.classList.remove("open");
  document.body.style.overflow = "";
}

function field(label, name, type = "text", required = false, options = null, wide = false, value = "", attrs = "") {
  let input;
  if (typeof options === "string") {
    input = `<select name="${name}" id="${name}" ${required ? "required" : ""} ${attrs}>${options}</select>`;
  } else if (Array.isArray(options)) {
    input = `<select name="${name}" id="${name}" ${required ? "required" : ""} ${attrs}>${options.map(x => `<option value="${esc(x)}" ${x === value ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>`;
  } else if (type === "textarea") {
    input = `<textarea name="${name}" id="${name}" ${required ? "required" : ""} ${attrs}>${esc(value)}</textarea>`;
  } else {
    input = `<input type="${type}" name="${name}" id="${name}" value="${esc(value)}" ${required ? "required" : ""} ${attrs}>`;
  }
  return `<label class="field ${wide ? "wide" : ""}">${label.toUpperCase()}${input}</label>`;
}

function getServiceOptionsForCategory(category, selectedService = "") {
  const mappedServices = SERVICE_CATALOG_MAP[category] || [];
  const stateServices = state.services
    .filter(s => (s.category || "").toLowerCase() === (category || "").toLowerCase())
    .map(s => s.serviceName);

  const combined = Array.from(new Set([...mappedServices, ...stateServices]));
  const selLower = String(selectedService || "").trim().toLowerCase();

  if (selectedService && !combined.some(name => name.toLowerCase() === selLower)) {
    combined.unshift(selectedService);
  }

  if (!combined.length) return `<option value="">Select a category first…</option>`;

  return `<option value="">Select service name…</option>` +
    combined.map(name => `<option value="${esc(name)}" ${name.toLowerCase() === selLower ? "selected" : ""}>${esc(name)}</option>`).join("");
}

function modal(type, clientId = null) {
  if (type === "client" && clientId && !isFounderOrAdmin()) {
    toast("Restricted: Only Founder / Admin can edit existing clients.");
    return;
  }
  if (type === "service" && !isFounderOrAdmin()) {
    toast("Restricted: Only Founder / Admin can add services.");
    return;
  }
  formType = type;
  editingClientId = type === "client" ? clientId : null;

  const existing = editingClientId ? state.clients.find(c => c.id === editingClientId) : null;
  const matchedSrv = existing ? getService(existing.serviceType) : null;

  const clientCategories = Object.keys(SERVICE_CATALOG_MAP);
  const activeCat = existing?.category || matchedSrv?.category || clientCategories[0];
  const catList = activeCat && !clientCategories.includes(activeCat) ? [...clientCategories, activeCat] : clientCategories;

  const categorySelectHtml = `<option value="">Select category…</option>` +
    catList.map(cat => `<option value="${esc(cat)}" ${cat === activeCat ? "selected" : ""}>${esc(cat)}</option>`).join("");

  const initialServiceOptionsHtml = getServiceOptionsForCategory(activeCat, existing?.serviceType || "");

  let clientForm = `
    <div class="form-grid">
      ${field("Client name", "clientName", "text", true, null, false, existing?.clientName || "")}
      ${field("Company", "company", "text", true, null, false, existing?.company || "")}
      ${field("Domain", "domain", "text", false, null, false, existing?.domain || "")}
      ${field("Contact person", "contactPerson", "text", false, null, false, existing?.contactPerson || "")}
      ${field("Email", "email", "email", false, null, false, existing?.email || "")}
      ${field("Phone", "phone", "tel", false, null, false, existing?.phone || "")}
      ${field("Account manager", "accountManager", "text", false, null, false, existing?.accountManager || currentSession?.fullName || "")}
      ${field("Category", "category", "select", true, categorySelectHtml)}
      ${field("Service name", "serviceType", "select", true, initialServiceOptionsHtml)}
      ${field("Status", "status", "select", true, STATUSES, false, existing?.status || STATUSES[0])}
      ${field("Standard rate (₹)", "standardRate", "number", false, null, false, existing?.standardRate ?? "")}
      ${field("Notes", "notes", "textarea", false, null, true, existing?.notes || "")}
    </div>
  `;

  let categoryOptions = [...Object.keys(SERVICE_CATALOG_MAP), "Other"];
  let serviceForm = `
    <div class="form-grid">
      ${field("Category", "category", "select", true, categoryOptions)}
      <label class="field">SERVICE NAME
        <input type="text" name="serviceName" id="serviceName" list="serviceCatalogDatalist" required placeholder="Choose or type service name">
        <datalist id="serviceCatalogDatalist">
          ${Object.values(SERVICE_CATALOG_MAP).flat().map(s => `<option value="${esc(s)}">`).join("")}
        </datalist>
      </label>
      ${field("Pricing model", "pricingModel", "select", true, ["Monthly Retainer", "One-time project fee", "Package rate", "Hourly rate"])}
      ${field("Standard rate (₹)", "standardRate", "number", true)}
      ${field("Billing frequency", "billingFrequency", "select", true, ["Per Project", "Monthly", "Quarterly", "Hourly"])}
      ${field("Deliverables description", "deliverablesDescription", "textarea", false, null, true)}
    </div>
  `;

  if (type === "client") {
    document.querySelector("#modalKicker").textContent = existing ? "EDIT CLIENT" : "NEW CLIENT";
    document.querySelector("#modalTitle").textContent = existing ? `Edit ${existing.clientName}` : "Add client";
  } else {
    document.querySelector("#modalKicker").textContent = "NEW SERVICE";
    document.querySelector("#modalTitle").textContent = "Add service";
  }

  document.querySelector("#recordForm").innerHTML = (type === "client" ? clientForm : serviceForm) + `
    <div class="form-actions">
      <button class="button secondary" type="button" data-close>Cancel</button>
      <button class="button primary">${existing ? "Update client" : `Save ${type}`}</button>
    </div>
  `;
  open("modal");
}

async function submitForm(e) {
  e.preventDefault();
  let d = Object.fromEntries(new FormData(e.target));
  if (formType === "client") {
    let resolvedService = getService(d.serviceType);
    let rate = d.standardRate !== "" ? +d.standardRate : (resolvedService ? resolvedService.standardRate : 0);
    let clientToSync = null;

    if (editingClientId) {
      if (!isFounderOrAdmin()) {
        toast("Restricted: Only Founder / Admin can modify existing clients.");
        close();
        return;
      }
      let idx = state.clients.findIndex(c => c.id === editingClientId);
      if (idx > -1) {
        let oldCompany = state.clients[idx].company;
        state.clients[idx] = {
          ...state.clients[idx],
          ...d,
          category: d.category || (resolvedService ? resolvedService.category : ""),
          standardRate: rate,
          pricingModel: resolvedService ? resolvedService.pricingModel : state.clients[idx].pricingModel || ""
        };
        if (draft.clientCompany === oldCompany) {
          draft.clientCompany = d.company;
        }
        clientToSync = state.clients[idx];
        log("✎", `Updated client details for <strong>${esc(d.company)}</strong>`);
        toast("Client details updated");
      }
      editingClientId = null;
    } else {
      let newClient = {
        id: `c${Date.now()}`,
        ...d,
        category: d.category || (resolvedService ? resolvedService.category : ""),
        standardRate: rate,
        pricingModel: resolvedService ? resolvedService.pricingModel : ""
      };
      state.clients.unshift(newClient);
      clientToSync = newClient;
      log("◉", `<strong>${esc(d.company)}</strong> was added to the client register`);
      toast("Client added");
    }
    syncProjectsWithRealClients();
    save();
    close();
    render();

    if (clientToSync) {
      sheetApi({ action: "saveClient", client: clientToSync });
    }
  } else {
    let newService = {
      id: `s${Date.now()}`,
      ...d,
      standardRate: +d.standardRate || 0
    };
    state.services.unshift(newService);
    log("◇", `<strong>${esc(d.serviceName)}</strong> was added to the service catalog`);
    toast("Service added");
    save();
    close();
    render();

    sheetApi({ action: "addService", service: newService });
  }
}

function updateDraft(k, v) {
  draft[k] = ["taxRate", "amountPaid"].includes(k) ? +v || 0 : v;
  invoices();
}

async function saveInvoice(markFullyPaid = false) {
  let c = client(draft.clientCompany), items = lines(draft.clientCompany);
  if (!c) { toast("Add and select a client before saving an invoice."); return; }
  if (!items.length) { toast("Assign a service to this client before invoicing."); return; }

  let virtual = { ...draft, items };
  let t = totals(virtual);

  if (markFullyPaid) {
    const utrInput = document.getElementById("upiRefInput");
    draft.transactionId = utrInput ? utrInput.value.trim() : "";
    draft.amountPaid = t.total;
    if (draft.transactionId && !draft.reference) {
      draft.reference = "UPI-" + draft.transactionId;
    }
    invoices(); // Refresh preview immediately to show PAID status & ₹0 balance
  }

  let newInv = {
    id: `i${Date.now()}`,
    ...draft,
    clientEmail: c.email || "",
    items
  };

  state.invoices.unshift(newInv);
  log("▤", `${markFullyPaid ? "Payment completed & invoice" : "Invoice"} <strong>${esc(draft.invoiceNo)}</strong> saved for ${esc(draft.clientCompany)}`);
  save();

  toast(markFullyPaid ? "Payment confirmed! Sending email & generating invoice..." : "Saving invoice to Google Sheets...");

  await sheetApi({
    action: "saveInvoice",
    notifyEmail: true,
    invoice: newInv
  });

  if (markFullyPaid) {
    toast("Receipt emailed to shaikmohamadmushakil@gmail.com");
    setTimeout(() => {
      window.print();
      draft = makeDraft(draft.clientCompany);
      render();
    }, 500);
  } else {
    draft = makeDraft(draft.clientCompany);
    render();
    toast("Invoice synced & emailed to Admin");
  }
}

function download() {
  let headers = ["Client Name", "Company", "Domain", "Contact Person", "Email", "Phone", "Account Manager", "Category", "Service Name", "Status", "Pricing Model", "Standard Rate (₹)"];
  let q = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
  let csv = [
    headers,
    ...state.clients.map(x => {
      let c = resolved(x);
      return [c.clientName, c.company, c.domain, c.contactPerson, c.email, c.phone, c.accountManager, c.category, c.serviceType, c.status, c.pricingModel, c.standardRate];
    })
  ].map(r => r.map(q).join(",")).join("\n");

  let a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "pikawebs-client-register.csv";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Client register downloaded");
}

function parseCsv(t) {
  let rows = [], row = [], val = "", quoted = false;
  for (let i = 0; i < t.length; i++) {
    let c = t[i], n = t[i + 1];
    if (c === '"' && quoted && n === '"') {
      val += '"';
      i++;
    } else if (c === '"') {
      quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(val.trim());
      val = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && n === "\n") i++;
      row.push(val.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      val = "";
    } else {
      val += c;
    }
  }
  if (val || row.length) {
    row.push(val.trim());
    rows.push(row);
  }
  return rows;
}

function clean(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function importFile(file) {
  let reader = new FileReader();
  reader.onload = () => {
    let rows = parseCsv(String(reader.result));
    if (rows.length < 2) {
      toast("This file needs a header row and a client record.");
      return;
    }
    let headers = rows[0].map(clean);
    let at = names => headers.findIndex(h => names.includes(h));
    let m = {
      clientName: at(["clientname", "name"]),
      company: at(["company", "companyname"]),
      domain: at(["domain", "website"]),
      contactPerson: at(["contactperson", "contactname"]),
      email: at(["email", "emailaddress"]),
      phone: at(["phone", "phonenumber", "mobile"]),
      accountManager: at(["accountmanager", "owner"]),
      category: at(["category", "servicecategory"]),
      serviceType: at(["servicetype", "servicename", "service"]),
      status: at(["status"]),
      pricingModel: at(["pricingmodel"]),
      standardRate: at(["standardrate", "standardrateinr", "rate"])
    };

    if (m.clientName < 0 || m.company < 0) {
      document.querySelector("#importStatus").textContent = "Couldn’t find Client Name and Company columns. Please export the main client table and try again.";
      toast("Import needs Client Name and Company columns");
      return;
    }

    let incoming = rows.slice(1).map((r, i) => {
      let get = k => m[k] >= 0 ? r[m[k]] || "" : "";
      let status = STATUSES.find(s => s.toLowerCase() === get("status").toLowerCase()) || "In Review";
      let srvName = get("serviceType");
      let matchedSrv = getService(srvName);
      return {
        id: `import${Date.now()}${i}`,
        clientName: get("clientName"),
        company: get("company"),
        domain: get("domain"),
        contactPerson: get("contactPerson"),
        email: get("email"),
        phone: get("phone"),
        accountManager: get("accountManager"),
        category: get("category") || matchedSrv?.category || "",
        serviceType: srvName,
        status,
        pricingModel: get("pricingModel"),
        standardRate: +get("standardRate").replace(/[^0-9.-]/g, "") || 0
      };
    }).filter(c => c.clientName && c.company);

    if (!incoming.length) {
      toast("No usable client rows found.");
      return;
    }

    if (confirm(`Replace ${state.clients.length} current clients with ${incoming.length} imported clients?`)) {
      state.clients = incoming;
      log("⇧", `Imported <strong>${incoming.length} clients</strong> from ${esc(file.name)}`);
      syncProjectsWithRealClients();
      save();
      render();
      document.querySelector("#importStatus").textContent = `Imported ${incoming.length} records from ${file.name}.`;
      toast(`${incoming.length} clients imported`);

      sheetApi({ action: "replaceClients", clients: incoming });
    }
  };
  reader.readAsText(file);
}

function empty(s) {
  return `<p style="padding:16px;color:#7692ad;font-size:12px">${esc(s)}</p>`;
}

function toast(s) {
  let e = document.querySelector("#toast");
  e.textContent = s;
  e.classList.add("show");
  clearTimeout(window.toasty);
  window.toasty = setTimeout(() => e.classList.remove("show"), 2600);
}

// Global click & interactive events
document.addEventListener("click", e => {
  let nav = e.target.closest("[data-view]");
  if (nav) {
    let id = nav.dataset.view;
    if ((id === "overview" || id === "invoices" || id === "reports" || id === "settings") && !isFounderOrAdmin()) {
      toast("Restricted view: Founder access only.");
      return;
    }
    document.querySelectorAll(".page").forEach(x => x.classList.toggle("active", x.id === id));
    document.querySelectorAll(".nav, .m-tab").forEach(x => x.classList.toggle("active", x.dataset.view === id));
    close();
    scrollTo({ top: 0, behavior: "smooth" });
  }

  let catBtn = e.target.closest(".cat-pill:not([data-proj-filter])");
  if (catBtn) {
    activeCategoryFilter = catBtn.dataset.cat;
    services();
  }

  let projFilterBtn = e.target.closest("[data-proj-filter]");
  if (projFilterBtn) {
    activeProjectFilter = projFilterBtn.dataset.projFilter;
    document.querySelectorAll("[data-proj-filter]").forEach(b => b.classList.toggle("active", b.dataset.projFilter === activeProjectFilter));
    projects();
  }

  let updateProjBtn = e.target.closest("[data-update-project]");
  if (updateProjBtn) {
    openProjectModal(updateProjBtn.dataset.updateProject);
  }

  if (e.target.closest("#refreshProjectsBtn")) {
    syncFromGoogleSheets();
  }

  if (e.target.closest("#refreshChatBtn")) {
    syncFromGoogleSheets();
    chat();
  }

  let jump = e.target.closest("[data-jump]");
  if (jump) document.querySelector(`[data-view="${jump.dataset.jump}"]`)?.click();

  if (e.target.closest("[data-close]") || e.target.id === "overlay") close();

  let editBtn = e.target.closest("[data-edit-client]");
  if (editBtn) {
    e.stopPropagation();
    close();
    modal("client", editBtn.dataset.editClient);
    return;
  }

  let row = e.target.closest("tr[data-client]");
  if (row) drawer(row.dataset.client);

  let viewClientBtn = e.target.closest("[data-view-client]");
  if (viewClientBtn) drawer(viewClientBtn.dataset.viewClient);

  let action = e.target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "add-client") modal("client");
    if (action.dataset.action === "add-service") modal("service");
    if (action.dataset.action === "export") download();
    if (action.dataset.action === "import") document.querySelector("#fileInput").click();
  }

  if (e.target.closest("#saveInvoice")) saveInvoice(false);
  if (e.target.closest("#completePaymentBtn")) saveInvoice(true);
  if (e.target.closest("#printInvoice")) print();

  if (e.target.closest("#syncBtn") || e.target.closest("#syncGasBtn") || e.target.closest("#refreshLogsBtn")) {
    syncFromGoogleSheets();
  }

  if (e.target.closest("#sidebarProfile") || e.target.closest("#headerAvatar")) {
    openProfileModal();
  }

  if (e.target.closest("#logoutBtn") || e.target.closest("#authSignOutBtn")) {
    localStorage.removeItem("client-hub-session");
    window.location.href = "login.html";
  }

  let invoice = e.target.closest("[data-invoice-client]");
  if (invoice) {
    draft = makeDraft(invoice.dataset.invoiceClient);
    document.querySelector('[data-view="invoices"]').click();
    toast("Invoice prepared for selected client");
  }

  if (e.target.closest("#menu")) {
    document.querySelector(".sidebar").classList.add("open");
    document.querySelector("#overlay").classList.add("open");
  }

  if (e.target.closest("#clearFilters")) {
    document.querySelector("#clientSearch").value = "";
    document.querySelector("#statusFilter").value = "all";
    filterClients();
  }

  if (e.target.closest("#restore")) {
    state = copy(sample);
    save();
    draft = makeDraft();
    render();
    toast("Workbook sample restored");
  }
});

// Event listener for dependent Category -> Service Name dropdown & auto-populating rate
document.addEventListener("change", e => {
  if (e.target.name === "category" && formType === "client") {
    let selectedCat = e.target.value;
    let serviceSelect = document.querySelector('#recordForm select[name="serviceType"]');
    let rateInput = document.querySelector('#recordForm input[name="standardRate"]');
    if (serviceSelect) {
      serviceSelect.innerHTML = getServiceOptionsForCategory(selectedCat);
    }
    if (rateInput) {
      rateInput.value = "";
    }
  }

  if (e.target.name === "serviceType" && formType === "client") {
    let s = getService(e.target.value);
    let rateInput = document.querySelector('#recordForm input[name="standardRate"]');
    if (s && rateInput) {
      rateInput.value = s.standardRate;
    }
  }

  if (e.target.name === "category" && formType === "service") {
    let cat = e.target.value;
    let datalist = document.querySelector("#serviceCatalogDatalist");
    if (datalist) {
      let list = SERVICE_CATALOG_MAP[cat] || Object.values(SERVICE_CATALOG_MAP).flat();
      datalist.innerHTML = list.map(s => `<option value="${esc(s)}">`).join("");
    }
  }
});

document.querySelector("#recordForm").addEventListener("submit", submitForm);

// Project update and Team Chat submit handlers
document.addEventListener("submit", async e => {
  if (e.target.id === "projectUpdateForm") {
    e.preventDefault();
    const fd = new FormData(e.target);
    const projId = fd.get("id");
    const idx = (state.projects || []).findIndex(p => p.id === projId);
    if (idx > -1) {
      state.projects[idx].status = fd.get("status");
      state.projects[idx].progress = Number(fd.get("progress")) || 0;
      state.projects[idx].targetDate = fd.get("targetDate") || "";
      state.projects[idx].assignedTo = fd.get("assignedTo") || "";
      state.projects[idx].latestUpdate = fd.get("latestUpdate") || "";
      state.projects[idx].updatedAt = "Just now";
      save();
      close();
      projects();
      toast("Project updated successfully");
      log("⎈", `Updated project <strong>${esc(state.projects[idx].clientCompany)}</strong> (${state.projects[idx].status})`);
      sheetApi({ action: "updateProject", project: state.projects[idx] });
    }
  }

  if (e.target.id === "chatForm") {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = (input?.value || "").trim();
    if (!text) return;

    const newMsg = {
      id: "MSG-" + Date.now().toString().slice(-6),
      senderEmail: currentSession?.email || "",
      fullName: currentSession?.fullName || "Team Member",
      role: currentSession?.role || "Team",
      message: text,
      timestamp: "Just now"
    };

    if (!Array.isArray(state.chatMessages)) state.chatMessages = [];
    state.chatMessages.push(newMsg);
    input.value = "";
    chat();
    save();

    const res = await sheetApi({
      action: "sendChatMessage",
      message: text,
      senderEmail: currentSession?.email,
      fullName: currentSession?.fullName,
      role: currentSession?.role
    });
    if (res && res.success && Array.isArray(res.chatMessages)) {
      state.chatMessages = res.chatMessages;
      save();
      chat();
    }
  }
});

// Periodic background team chat sync every 12 seconds
setInterval(async () => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) return;
  try {
    const data = await sheetApi({ action: "getChat" });
    if (data && data.success && Array.isArray(data.chatMessages) && data.chatMessages.length !== (state.chatMessages || []).length) {
      state.chatMessages = data.chatMessages;
      save();
      chat();
    }
  } catch {}
}, 12000);
document.querySelector("#clientSearch").addEventListener("input", filterClients);
document.querySelector("#statusFilter").addEventListener("change", filterClients);
document.querySelector("#fileInput").addEventListener("change", e => {
  if (e.target.files[0]) importFile(e.target.files[0]);
  e.target.value = "";
});

document.querySelector("#invoiceClient").addEventListener("change", e => updateDraft("clientCompany", e.target.value));

[["invoiceDate", "date"], ["invoiceDue", "due"], ["invoiceNo", "invoiceNo"], ["invoiceRef", "reference"], ["taxRate", "taxRate"], ["amountPaid", "amountPaid"]].forEach(([id, k]) => {
  document.querySelector(`#${id}`).addEventListener("change", e => updateDraft(k, e.target.value));
});

document.querySelector("#globalSearch").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.querySelector('[data-view="clients"]').click();
    document.querySelector("#clientSearch").value = e.target.value;
    filterClients();
  }
});

document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    document.querySelector("#globalSearch").focus();
  }
  if (e.key === "Escape") close();
});

render();

// Initial sync with Google Sheets on load if URL is set
if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
  syncFromGoogleSheets();
} else {
  finishSplash();
}

// Network-aware Google Workspace / Gemini Splash Controller
const splashStart = Date.now();
function finishSplash() {
  const splash = document.getElementById("splashIntro");
  if (!splash || splash.classList.contains("done")) return;
  const elapsed = Date.now() - splashStart;
  const minDuration = 1400; // Ensures the smooth Gemini/Workspace reveal plays cleanly
  const wait = Math.max(0, minDuration - elapsed);
  setTimeout(() => splash.classList.add("done"), wait);
}

// Auto-dismiss fallback after 4.5s even if offline
setTimeout(finishSplash, 4500);
