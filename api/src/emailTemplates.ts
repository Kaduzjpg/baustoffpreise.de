import { InquiryPayload } from './schemas';

export function dealerNotificationTemplate(params: {
  inquiryId: number;
  inquiry: InquiryPayload;
  dealerName: string;
}): { subject: string; html: string; text: string } {
  const { inquiryId, inquiry, dealerName } = params;
  const subject = `Neue Anfrage #${inquiryId} aus ${inquiry.zip}`;
  const itemsHtml = inquiry.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 8px;border:1px solid #eee;">${it.productId}</td><td style="padding:6px 8px;border:1px solid #eee;">${it.quantity}</td><td style="padding:6px 8px;border:1px solid #eee;">${it.note ?? ''}</td></tr>`
    )
    .join('');
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
    <h2 style="margin:0 0 12px">Hallo ${dealerName}, neue Anfrage #${inquiryId}</h2>
    <p><strong>Kunde:</strong> ${inquiry.customerName} (${inquiry.customerEmail}${inquiry.customerPhone ? ', ' + inquiry.customerPhone : ''})</p>
    <p><strong>PLZ:</strong> ${inquiry.zip} · <strong>Radius:</strong> ${inquiry.radius} km</p>
    ${inquiry.note ? `<p><strong>Hinweis des Kunden:</strong> ${inquiry.note}</p>` : ''}
    <table style="border-collapse:collapse;margin-top:12px">
      <thead>
        <tr><th style="text-align:left;padding:6px 8px;border:1px solid #eee;">Produkt-ID</th><th style="text-align:left;padding:6px 8px;border:1px solid #eee;">Menge</th><th style="text-align:left;padding:6px 8px;border:1px solid #eee;">Notiz</th></tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:16px">Bitte antworten Sie dem Kunden direkt per E-Mail.</p>
  </div>`;
  const text = `Neue Anfrage #${inquiryId}\nKunde: ${inquiry.customerName} (${inquiry.customerEmail}${
    inquiry.customerPhone ? ', ' + inquiry.customerPhone : ''
  })\nPLZ ${inquiry.zip}, Radius ${inquiry.radius} km\n${
    inquiry.note ? 'Hinweis: ' + inquiry.note + '\n' : ''
  }Artikel: ${inquiry.items
    .map((it) => `\n- Produkt ${it.productId} x ${it.quantity} ${it.note ? '(' + it.note + ')' : ''}`)
    .join('')}`;
  return { subject, html, text };
}

export function customerConfirmationTemplate(params: {
  inquiryId: number;
  inquiry: InquiryPayload;
}): { subject: string; html: string; text: string } {
  const { inquiryId, inquiry } = params;
  const subject = `Ihre Anfrage #${inquiryId} ist eingegangen`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
    <h2 style="margin:0 0 12px">Danke, ${inquiry.customerName}!</h2>
    <p>Ihre Anfrage <strong>#${inquiryId}</strong> wurde an passende Händler in Ihrem Umkreis gesendet. Die Händler melden sich per E-Mail bei Ihnen.</p>
  </div>`;
  const text = `Danke! Ihre Anfrage #${inquiryId} wurde an Händler gesendet.`;
  return { subject, html, text };
}


