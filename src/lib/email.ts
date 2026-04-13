import { Resend } from "resend";
import { db } from "@/lib/db";
import { emailTemplates, emailLog } from "@/lib/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY || "re_EM5tYM1B_LWRmcj9fw5Sy4M1nV2Hj9Qng");
const FROM = process.env.RESEND_FROM || "Bump & Bundle <hello@bumpandbundle.com>";
const FALLBACK_FROM = "Bump & Bundle <onboarding@resend.dev>";

// Replace {{variable}} placeholders in a template string
function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function sendTemplateEmail({
  to,
  templateKey,
  vars = {},
}: {
  to: string;
  templateKey: string;
  vars?: Record<string, string>;
}) {
  // Load template from DB
  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.key, templateKey))
    .limit(1);

  if (!template) {
    throw new Error(`Email template not found: ${templateKey}`);
  }

  const subject = interpolate(template.subject, vars);
  const html = interpolate(template.html, vars);

  let resendId: string | undefined;
  let status = "sent";
  let error: string | undefined;

  // Try primary from address, fall back if domain not yet verified
  const { data, error: resendErr } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (resendErr) {
    // Try fallback
    const { data: fallbackData, error: fallbackErr } = await resend.emails.send({
      from: FALLBACK_FROM,
      to,
      subject,
      html,
    });

    if (fallbackErr) {
      status = "failed";
      error = JSON.stringify(fallbackErr);
    } else {
      resendId = fallbackData?.id;
      status = "sent_fallback";
    }
  } else {
    resendId = data?.id;
  }

  // Log every attempt
  await db.insert(emailLog).values({
    toEmail: to,
    subject,
    templateKey,
    status,
    resendId: resendId ?? null,
    error: error ?? null,
  });

  if (status === "failed") {
    throw new Error(`Failed to send email: ${error}`);
  }

  return { resendId, status };
}

// Send a raw email (no template) — still logs it
export async function sendRawEmail({
  to,
  subject,
  html,
  templateKey,
}: {
  to: string;
  subject: string;
  html: string;
  templateKey?: string;
}) {
  let resendId: string | undefined;
  let status = "sent";
  let error: string | undefined;

  const { data, error: resendErr } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (resendErr) {
    const { data: fallbackData, error: fallbackErr } = await resend.emails.send({
      from: FALLBACK_FROM,
      to,
      subject,
      html,
    });

    if (fallbackErr) {
      status = "failed";
      error = JSON.stringify(fallbackErr);
    } else {
      resendId = fallbackData?.id;
      status = "sent_fallback";
    }
  } else {
    resendId = data?.id;
  }

  await db.insert(emailLog).values({
    toEmail: to,
    subject,
    templateKey: templateKey ?? null,
    status,
    resendId: resendId ?? null,
    error: error ?? null,
  });

  if (status === "failed") {
    throw new Error(`Failed to send email: ${error}`);
  }

  return { resendId, status };
}
