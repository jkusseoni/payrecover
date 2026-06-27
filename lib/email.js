import { Resend } from 'resend';

// .env.local से API key उठा रहा है
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminder({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Resend Error:', err);
    throw err;
  }
}