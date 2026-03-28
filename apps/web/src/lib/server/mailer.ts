import nodemailer from "nodemailer";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Envía el enlace de restablecimiento. Sin SMTP configurado, en desarrollo solo registra en consola.
 * Variables opcionales: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, MAIL_FROM
 */
export async function sendPasswordResetEmail(to: string, resetPathWithQuery: string): Promise<void> {
  const url = `${siteUrl()}${resetPathWithQuery}`;
  const host = (process.env.SMTP_HOST ?? "").trim();

  if (!host) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[Ruta mail · dev] Restablecer contraseña →", to, "\n ", url);
    }
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = port === 465;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  const from = (process.env.SMTP_FROM ?? process.env.MAIL_FROM ?? "no-reply@localhost").trim();

  await transporter.sendMail({
    from,
    to,
    subject: "Restablecer contraseña — Ruta",
    text: `Hola,\n\nPara elegir una nueva contraseña abre este enlace (caduca en 1 hora):\n${url}\n\nSi no lo pediste, ignora este mensaje.`,
    html: `<p>Hola,</p><p>Para elegir una nueva contraseña abre este enlace (caduca en 1 hora):</p><p><a href="${url}">${url}</a></p><p>Si no lo pediste, ignora este mensaje.</p>`,
  });
}
