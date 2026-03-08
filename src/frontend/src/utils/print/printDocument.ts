export interface PrintDocumentOptions {
  title: string;
  businessName?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  authorizedSignatory?: string;
  signatoryDesignation?: string;
  content: string;
  logoUrl?: string;
}

export function printDocument(options: PrintDocumentOptions): void {
  const {
    title,
    businessName = "Your Business",
    address = "",
    phone = "",
    email = "",
    gstin = "",
    authorizedSignatory = "",
    signatoryDesignation = "",
    content,
    logoUrl,
  } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print documents");
    return;
  }

  const logoHTML = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="max-height: 60px; max-width: 120px; object-fit: contain;" />`
    : `<div style="width:60px;height:60px;background:linear-gradient(135deg,#E87722 0%,#C95E00 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:20px;">${businessName.charAt(0)}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a2e;
      background: white;
      padding: 0;
    }
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .letterhead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 3px solid #E87722;
      margin-bottom: 24px;
    }
    .letterhead-left {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .company-name {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .company-details {
      font-size: 11px;
      color: #555;
      line-height: 1.6;
    }
    .doc-title {
      text-align: right;
      font-size: 22px;
      font-weight: 700;
      color: #E87722;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-date {
      text-align: right;
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
    .content-area {
      flex: 1;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
      padding: 6px 12px;
      background: #f5f5f5;
      border-left: 4px solid #E87722;
      margin-bottom: 12px;
    }
    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .field-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: 600;
      color: #555;
      min-width: 140px;
      font-size: 11px;
    }
    .field-value {
      color: #1a1a2e;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11px;
    }
    th {
      background: #1a1a2e;
      color: white;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 7px 12px;
      border-bottom: 1px solid #eee;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .signature-area {
      margin-top: auto;
      padding-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-block {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      width: 200px;
      margin: 0 auto 6px;
    }
    .signature-name {
      font-weight: 700;
      font-size: 12px;
    }
    .signature-designation {
      font-size: 10px;
      color: #666;
    }
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 10px;
      color: #888;
    }
    @media print {
      body { padding: 0; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="letterhead">
      <div class="letterhead-left">
        ${logoHTML}
        <div>
          <div class="company-name">${businessName}</div>
          <div class="company-details">
            ${address ? `${address}<br/>` : ""}
            ${phone ? `Tel: ${phone}  ` : ""}${email ? `Email: ${email}` : ""}
            ${gstin ? `<br/>GSTIN: ${gstin}` : ""}
          </div>
        </div>
      </div>
      <div>
        <div class="doc-title">${title}</div>
        <div class="doc-date">Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
      </div>
    </div>
    <div class="content-area">
      ${content}
    </div>
    <div class="signature-area">
      <div>
        <div class="field-row"><span class="field-label">Document generated on:</span><span class="field-value">${new Date().toLocaleString("en-IN")}</span></div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${authorizedSignatory || "Authorized Signatory"}</div>
        <div class="signature-designation">${signatoryDesignation || ""}</div>
        <div class="signature-designation">${businessName}</div>
      </div>
    </div>
    <div class="footer">This is a computer-generated document. Generated by MSME Desk India.</div>
  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 1500);
    }
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function generateDocumentContent(
  fieldValues: Record<string, string>,
  templateName: string,
): string {
  const entries = Object.entries(fieldValues).filter(([, v]) => v);
  if (!entries.length) return "<p>No content available</p>";

  const rows = entries
    .map(
      ([key, value]) => `
    <div class="field-row">
      <span class="field-label">${formatFieldLabel(key)}:</span>
      <span class="field-value">${value}</span>
    </div>`,
    )
    .join("");

  return `
    <div class="section">
      <div class="section-title">${templateName} Details</div>
      ${rows}
    </div>
  `;
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}
