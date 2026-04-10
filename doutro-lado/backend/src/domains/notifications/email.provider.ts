import { env } from "../../config/env.js";

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
