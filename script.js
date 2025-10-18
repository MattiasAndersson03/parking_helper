// === Configuration ==================================================
const COMPANIES = [
  {
    id: "parkster",
    name: "Parkster",
    smsNumber: "+46707-13 14 15",
    template: "{ZON} {REG} {PNR}",
    pnrLength: 10
  },
  {
    id: "aimo",
    name: "Aimo Park",
    smsNumber: "+4671 711",
    template: "{ZON} {REG} {PNR}",
    pnrLength: 10
  },
  {
    id: "easypark",
    name: "EasyPark",
    smsNumber: "+4610 333 44 00",
    template: "{ZON} {REG} {PNR}", 
    pnrLength: 10
  }
];
// ====================================================================

// Populate dropdown
const companySelect = document.getElementById("company");
COMPANIES.forEach(c => {
  const opt = document.createElement("option");
  opt.value = c.id;
  opt.textContent = c.name;
  companySelect.appendChild(opt);
});

// Elements
const pnrInput   = document.getElementById("pnr");
const regInput   = document.getElementById("reg");
const zoneInput  = document.getElementById("zone");
const btnIOS     = document.getElementById("btnIOS");
const btnAndroid = document.getElementById("btnAndroid");
const desktopNote = document.getElementById("desktopNote");

// Basic normalization
const onlyDigits = s => (s || "").replace(/\D/g, "");
const cleanPnr   = s => { const d = onlyDigits(s); return (d.length===10 || d.length===12) ? d : null; };
const cleanReg   = s => { const v = (s||"").toUpperCase().replace(/\s+/g,""); return v.length>=3 ? v : null; };
const cleanZone  = s => { const d = onlyDigits(s); return d.length ? d : null; };

// Template fill (Safari-safe)
function fillTemplate(tpl, map){
  return tpl.replace(/\{PNR\}/g, map.PNR)
            .replace(/\{REG\}/g, map.REG)
            .replace(/\{ZON\}/g, map.ZON);
}

// Build explicit iOS/Android href
function buildHref(platform, number, body){
  const enc = encodeURIComponent(body);
  return platform === "ios"
    ? `sms:${number}&body=${enc}`     // iOS
    : `sms:${number}?body=${enc}`;    // Android
}

// Open helper
function openSms(platform){
  const comp = COMPANIES.find(c => c.id === companySelect.value);
  if (!comp) return alert("Välj ett parkeringsföretag först.");

  const pnr = formatPnr(pnrInput.value, comp);
  const reg = cleanReg(regInput.value);
  const zon = cleanZone(zoneInput.value);

  if (!pnr) return alert("Ogiltigt personnummer (minst 12 siffror).");
  if (!reg) return alert("Ogiltigt registreringsnummer (minst 3 tecken).");
  if (!zon) return alert("Ogiltig zonkod (endast siffror).");

  const body = fillTemplate(comp.template, { PNR: pnr, REG: reg, ZON: zon });
  const href = buildHref(platform, comp.smsNumber, body);
  window.location.href = href;
}

// Bind buttons
btnIOS.addEventListener("click",     () => openSms("ios"));
btnAndroid.addEventListener("click", () => openSms("android"));

// Optional: show desktop hint
if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  desktopNote.hidden = false;
}

// Format PNR based on company
function formatPnr(raw, company) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length !== 12) return null; 
  if (company.pnrLength === 10) {
    return digits.slice(2);
  }
  return digits;
}

