import { env } from "../../config/env.js";

export type RecoveryWhatsAppPayload = {
  to: string; // E.164 format, e.g. +5511999999999
  recipientName: string | null;
  brand: string;
  offerCode: string;
  discountPercent: number;
  cartUrl: string;
};

/**
 * Send a bag recovery WhatsApp message via Twilio.
 * No-ops if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM are not configured.
 */
export async function sendRecoveryWhatsApp(payload: RecoveryWhatsAppPayload): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) return;

  const name = payload.recipientName ?? "cliente";
  const brandLabel = payload.brand === "moda" ? "Moda & Acessórios" : "Casa & Decoração";

  const body =
    `Olá, ${name}! 👋\n\n` +
    `Sua bag D'Outro Lado (${brandLabel}) ainda está esperando por você.\n\n` +
    `Use o código *${payload.offerCode}* para garantir *${payload.discountPercent}% de desconto* na finalização:\n` +
    `${payload.cartUrl}\n\n` +
    `_Oferta exclusiva e de uso único. Disponível por tempo limitado._`;

  const credentials = Buffer.from(
    `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
  ).toString("base64");

  const form = new URLSearchParams({
    From: `whatsapp:${env.TWILIO_WHATSAPP_FROM}`,
    To: `whatsapp:${payload.to}`,
    Body: body,
  });

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    }
  );
}
