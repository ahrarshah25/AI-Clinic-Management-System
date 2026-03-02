const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const downloadPrescriptionPdf = (prescription, clinicName = "AI Clinic Management") => {
  if (typeof window === "undefined") return;

  const medications = prescription?.medications || [];
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>Prescription - ${escapeHtml(prescription?.patientName || "Patient")}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 14px; }
          th { background: #eff6ff; }
          .meta { margin-bottom: 16px; }
          .note { margin-top: 18px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(clinicName)}</h1>
        <p><strong>Prescription Date:</strong> ${escapeHtml(
          prescription?.date ? new Date(prescription.date).toLocaleDateString() : new Date().toLocaleDateString()
        )}</p>
        <div class="meta">
          <p><strong>Patient:</strong> ${escapeHtml(prescription?.patientName || "-")}</p>
          <p><strong>Doctor:</strong> ${escapeHtml(prescription?.doctorName || "-")}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${
              medications.length
                ? medications
                    .map(
                      (med) => `
                <tr>
                  <td>${escapeHtml(med?.name || "-")}</td>
                  <td>${escapeHtml(med?.dosage || "-")}</td>
                  <td>${escapeHtml(med?.frequency || "-")}</td>
                  <td>${escapeHtml(med?.duration || "-")}</td>
                </tr>`
                    )
                    .join("")
                : "<tr><td colspan='4'>No medication details</td></tr>"
            }
          </tbody>
        </table>
        <p class="note"><strong>Notes:</strong> ${escapeHtml(prescription?.instructions || prescription?.notes || "-")}</p>
        <p class="note"><strong>AI Explanation:</strong> ${escapeHtml(prescription?.aiExplanation || "-")}</p>
        <p class="note"><strong>Lifestyle:</strong> ${escapeHtml(
          Array.isArray(prescription?.lifestyleRecommendations)
            ? prescription.lifestyleRecommendations.join(", ")
            : "-"
        )}</p>
        <p class="note"><strong>Preventive Advice:</strong> ${escapeHtml(
          Array.isArray(prescription?.preventiveAdvice)
            ? prescription.preventiveAdvice.join(", ")
            : "-"
        )}</p>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
