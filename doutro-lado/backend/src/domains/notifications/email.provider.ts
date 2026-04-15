import { env } from "../../config/env.js";

// =============================================================================
// Order confirmation email — Stage 17
// =============================================================================

export type OrderConfirmationEmailPayload = {
  to: string;
  recipientName: string | null;
  publicOrderId: string;
  brand: string;
  /** ISO country code for the destination, e.g. "CH" */
  destinationCountryCode: string | null;
  destinationCountryName: string | null;
  /** Total in BRL */
  totalBRL: number;
  /** Display currency (may differ from BRL for international orders) */
  displayCurrency: string;
  /** Total in display currency */
  totalDisplay: number;
  /** Items in the order */
  items: { name: string; quantity: number; unitPriceBRL: number }[];
  /** From country_policies — appended at the bottom of the email. Null if not seeded. */
  countryConfirmationNote: string | null;
  /** Support email from country policy */
  supportEmail: string | null;
};

/**
 * Send an order confirmation email via Resend.
 * No-ops if RESEND_API_KEY is not configured.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationEmailPayload): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  const name = payload.recipientName ?? "customer";
  const countryLine = payload.destinationCountryName
    ? `${payload.destinationCountryName}${payload.destinationCountryCode ? ` (${payload.destinationCountryCode})` : ""}`
    : null;

  const itemRows = payload.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:rgba(255,255,255,0.8);border-bottom:1px solid rgba(255,255,255,0.06)">${i.name}</td>
          <td style="padding:8px 0;font-size:14px;color:rgba(255,255,255,0.5);text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">×${i.quantity}</td>
          <td style="padding:8px 0;font-size:14px;color:rgba(255,255,255,0.8);text-align:right;border-bottom:1px solid rgba(255,255,255,0.06)">R$ ${(i.unitPriceBRL * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const supportLine = payload.supportEmail
    ? `<p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.3)">Questions? Contact us at <a href="mailto:${payload.supportEmail}" style="color:rgba(198,169,107,0.7);text-decoration:none">${payload.supportEmail}</a></p>`
    : "";

  const confirmationNote = payload.countryConfirmationNote
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4)">${payload.countryConfirmationNote}</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#fff">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid rgba(198,169,107,0.25);border-radius:24px;overflow:hidden">
        <tr><td style="background:linear-gradient(160deg,rgba(198,169,107,0.12),rgba(0,0,0,0.9));padding:48px 48px 40px">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(198,169,107,0.7)">D'OUTRO LADO Moda</p>
          <h1 style="margin:0 0 24px;font-size:28px;font-weight:300;line-height:1.2;letter-spacing:-.5px;color:#fff">Order confirmed.</h1>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65)">
            Thank you, ${name}. Your order has been received and will be dispatched within 1–2 business days.
          </p>
          ${countryLine ? `<p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4)">Shipping to: ${countryLine}</p>` : ""}

          <!-- Order ID -->
          <div style="margin:28px 0 20px;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.3)">Order ID</p>
            <p style="margin:0;font-size:16px;font-family:monospace;color:#fff">${payload.publicOrderId}</p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1)">Item</th>
                <th style="text-align:center;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1)">Qty</th>
                <th style="text-align:right;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1)">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 0 0;font-size:13px;color:rgba(255,255,255,0.5)">Total (incl. shipping &amp; taxes)</td>
                <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#C6A96B;text-align:right">R$ ${payload.totalBRL.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          ${confirmationNote}
          ${supportLine}

          <p style="margin:32px 0 0;font-size:12px;color:rgba(255,255,255,0.25)">
            You will receive a shipping confirmation with tracking information once your order has been dispatched.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RECOVERY_EMAIL_FROM,
      to: [payload.to],
      subject: `Order confirmed — ${payload.publicOrderId} · D'OUTRO LADO`,
      html,
    }),
  });
}

// =============================================================================
// Recovery email
// =============================================================================

export type RecoveryEmailPayload = {
  to: string;
  recipientName: string | null;
  brand: string;
  offerCode: string;
  discountPercent: number;
  cartUrl: string;
  validUntil: Date;
};

/**
 * Send a bag recovery email via Resend.
 * No-ops if RESEND_API_KEY is not configured.
 */
export async function sendRecoveryEmail(payload: RecoveryEmailPayload): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  const expiresFormatted = payload.validUntil.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const brandLabel = payload.brand === "moda" ? "Moda & Acessórios" : "Casa & Decoração";
  const name = payload.recipientName ?? "cliente";

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#fff">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid rgba(198,169,107,0.25);border-radius:24px;overflow:hidden">
        <tr><td style="background:linear-gradient(160deg,rgba(198,169,107,0.12),rgba(0,0,0,0.9));padding:48px 48px 40px">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(198,169,107,0.7)">${brandLabel}</p>
          <h1 style="margin:0 0 24px;font-size:28px;font-weight:300;line-height:1.2;letter-spacing:-.5px;color:#fff">Sua bag ainda está aqui.</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65)">
            Olá, ${name}. Você deixou itens selecionados na sua bag D'Outro Lado.
            Para facilitar sua decisão, preparamos um desconto exclusivo:
          </p>
          <div style="margin:32px 0;border:1px solid rgba(198,169,107,0.3);border-radius:16px;padding:24px;text-align:center;background:rgba(198,169,107,0.05)">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.25em;text-transform:uppercase;color:rgba(198,169,107,0.6)">Seu código exclusivo</p>
            <p style="margin:0 0 4px;font-size:36px;font-weight:700;letter-spacing:.1em;color:#C6A96B">${payload.offerCode}</p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5)">${payload.discountPercent}% de desconto · válido até ${expiresFormatted}</p>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="${payload.cartUrl}" style="display:inline-block;padding:16px 40px;border-radius:999px;background:#C6A96B;color:#000;font-size:13px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;text-decoration:none">
              Retomar bag
            </a>
          </div>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.3)">
            Este código é pessoal e de uso único. Não compartilhe. Expira em ${expiresFormatted}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RECOVERY_EMAIL_FROM,
      to: [payload.to],
      subject: `Sua bag D'Outro Lado — ${payload.discountPercent}% de desconto para você`,
      html,
    }),
  });
}
