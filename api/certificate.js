const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { name, role, company, date, modules, scCount, roleLbl } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const SIG = `<svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 48 C18 42,22 30,28 22 C34 14,38 12,36 18 C34 24,26 34,20 38 C14 42,18 36,24 30 C30 24,36 20,32 28 C28 36,22 42,18 44" stroke="#122D6E" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 38 C24 34,30 28,38 22 C46 16,54 10,60 8 C66 6,62 12,56 18 C50 24,42 32,48 28 C54 24,62 16,68 12" stroke="#122D6E" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 18 C52 24,46 32,40 38 C34 44,30 46,28 44" stroke="#122D6E" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.8"/><path d="M68 12 C72 10,78 14,82 18 C86 22,84 28,78 32 C72 36,66 34,68 28 C70 22,76 18,82 20" stroke="#122D6E" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M82 20 C86 22,90 18,94 14 C98 10,102 12,100 18 C98 24,92 30,88 34 C84 38,80 42,82 40 C84 38,90 32,96 28 C102 24,106 26,104 30" stroke="#122D6E" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 50 C44 48,62 44,80 42 C90 41,98 42,104 40" stroke="#122D6E" stroke-width="0.7" fill="none" stroke-linecap="round" opacity="0.25"/></svg>`;

  const modsHtml = (modules || [])
    .map((m, i) => `<li><span class="cm-n">${i + 1}.</span><span><span class="cm-t">${m.title}</span>: ${m.desc}</span></li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{margin:0;size:A4}
body{font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;background:white;color:#122D6E;margin:0;padding:0}
.cert{padding:36px 40px 30px;position:relative;width:210mm;min-height:297mm;margin:0}
.c-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:12px;border-bottom:2.5px solid #122D6E}
.c-hdr-logo{display:flex;align-items:center;gap:8px}
.c-hdr-logo .bolt{width:26px;height:26px;background:#FF5100;border-radius:6px;display:flex;align-items:center;justify-content:center}
.c-hdr-logo span{font-size:15px;font-weight:700;color:#122D6E}
.c-hdr-contact{text-align:right;font-size:10px;line-height:1.5;color:#122D6E;opacity:.5}
.c-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#FF5100;margin-bottom:14px}
.c-subtitle{font-size:10.5px;color:#122D6E;opacity:.5;margin-top:-10px;margin-bottom:14px}
.c-to-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#122D6E;opacity:.5;margin-bottom:3px}
.c-name{font-size:20px;font-weight:700;color:#122D6E}
.c-role,.c-comp{font-size:12px;color:#122D6E;opacity:.7}
.c-body{font-size:12px;line-height:1.65;color:#122D6E;margin:14px 0}
.c-box{margin:10px 0;padding:10px 14px;background:#F0F2F8;border-radius:6px;font-size:10.5px;line-height:1.6;color:#122D6E}
.c-box .label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:4px;opacity:.5}
.c-box ul{margin:0;padding:0;list-style:none}
.c-box ul li{padding:1.5px 0}
.c-box ul li::before{content:"• ";opacity:.5}
.c-section-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#122D6E;opacity:.5;margin:12px 0 5px}
.c-mods{margin:0;padding:0;list-style:none}
.c-mods li{display:flex;gap:6px;font-size:11px;line-height:1.55;color:#122D6E;padding:2px 0}
.c-mods li .cm-n{font-weight:700;min-width:16px;flex-shrink:0}
.c-mods li .cm-t{font-weight:700}
.c-notes{font-size:10.5px;line-height:1.6;color:#122D6E;margin-bottom:10px}
.c-legal{margin:10px 0;padding:10px 14px;border:1px solid #e0e3ed;border-radius:6px;font-size:10px;line-height:1.6;color:#122D6E}
.c-legal .label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:3px;opacity:.5}
.c-foot{margin-top:18px;padding-top:14px;border-top:1px solid #e0e3ed;display:flex;justify-content:space-between;align-items:flex-end}
.c-foot-left{font-size:11px;line-height:1.5;color:#122D6E}
.c-foot-right{font-size:10px;text-align:right;color:#122D6E;opacity:.45;line-height:1.4}
.c-accent{height:3.5px;background:linear-gradient(135deg,#FF5100 0%,#e03d00 100%);position:absolute;bottom:0;left:0;right:0}
</style>
</head>
<body>
<div class="cert">
  <div class="c-hdr">
    <div class="c-hdr-logo">
      <div class="bolt"><svg width="11" height="14" viewBox="0 0 14 18" fill="none"><path d="M8.5 1L1 10.5H7L5.5 17L13 7.5H7L8.5 1Z" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/></svg></div>
      <span>braingineering.</span>
    </div>
    <div class="c-hdr-contact">Braingineering GmbH | Modecenterstraße 20/1/193, 1030 Wien<br>office@braingineering.at | +43 676 393 0094</div>
  </div>

  <div class="c-title">Teilnahmezertifikat</div>
  <div class="c-subtitle">KI-Kompetenz gem. Artikel 4, Verordnung (EU) 2024/1689</div>

  <div style="margin-bottom:12px">
    <div class="c-to-lbl">Ausgestellt für</div>
    <div class="c-name">${name}</div>
    ${role ? `<div class="c-role">${role}</div>` : ""}
    ${company ? `<div class="c-comp">${company}</div>` : ""}
  </div>

  <div class="c-body">hat am <strong>${date}</strong> das E-Learning-Modul zur KI-Kompetenz der Braingineering GmbH vollständig absolviert.</div>

  <div class="c-box">
    <div class="label">Format und Methodik</div>
    <ul>
      <li>Interaktives, szenariobasiertes E-Learning</li>
      <li>${scCount} realitätsnahe Entscheidungssituationen aus dem Ingenieurbüro-Alltag</li>
      <li>Eigenständige Entscheidungsfindung mit unmittelbarer fachlicher Rückmeldung</li>
      <li>Szenarien branchenspezifisch für Ingenieurbüros${role ? ` und im Kontext der Rolle "${role}"` : ""} konzipiert</li>
      <li>Kompetenzprofil: ${roleLbl || "KI-Anwender"}</li>
    </ul>
  </div>

  <div class="c-section-title">Geschulte Inhalte (${(modules || []).length} Module, ${scCount} Szenarien)</div>
  <ol class="c-mods">${modsHtml}</ol>

  <div class="c-section-title">Insbesondere wurde hingewiesen auf</div>
  <div class="c-notes">
    Prüfpflicht bei KI-generierten Ergebnissen vor beruflicher Verwendung. Ausschließliche Nutzung DSGVO-konformer Systeme für Firmendaten. Dokumentationspflicht des Arbeitgebers gem. EU AI Act. Eigenverantwortung jedes Mitarbeitenden im Umgang mit KI-Werkzeugen.
  </div>

  <div class="c-legal">
    <div class="label">Rechtsgrundlage</div>
    Art. 4 der Verordnung (EU) 2024/1689 (EU AI Act), in Kraft seit 2.2.2025, verpflichtet Betreiber von KI-Systemen, nach besten Kräften sicherzustellen, dass ihr Personal über ausreichende KI-Kompetenz verfügt (Bemühungspflicht). Dieses Zertifikat dokumentiert die Durchführung einer entsprechenden Maßnahme.
  </div>

  <div class="c-foot">
    <div class="c-foot-left">
      <strong>Wien, ${date}</strong>
      <div style="margin:10px 0 4px">${SIG}</div>
      <div style="font-size:10.5px;color:#122D6E;line-height:1.4"><strong>Dragan Komsic</strong><br>Geschäftsführer, Braingineering GmbH</div>
    </div>
    <div class="c-foot-right">
      Braingineering GmbH<br>FN 661950g | HG Wien<br>UID: ATU81137629<br>braingineering.at
    </div>
  </div>
  <div class="c-accent"></div>
</div>
</body>
</html>`;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for Google Fonts to load
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="KI-Awareness-Zertifikat_${name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`);
    res.status(200).send(pdf);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed", details: err.message });
  }
};
