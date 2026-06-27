import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendReminder } from '@/lib/email';
import dayjs from 'dayjs';

export async function GET() {
  try {
    // 1. डेटाबेस से सिर्फ pending इनवॉइस फेच कर रहे हैं
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, clients(email)')
      .eq('status', 'pending');

    if (error) throw error;
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ success: true, message: "No pending invoices found." });
    }

    let emailsSent = 0;

    for (let invoice of invoices) {
      // 🔥 REMINDER STOP LOGIC (Safety Guard)
      // अगर इनवॉइस का स्टेटस किसी भी वजह से 'paid' है, तो यहीं से स्किप (Skip) कर दें
      if (invoice.status === 'paid') {
        continue;
      }

      const daysOverdue = dayjs().diff(invoice.due_date, 'day');
      let greetingMessage = '';

      // दिनों के हिसाब से सही रिमाइंडर मैसेज चुनें
      if (daysOverdue >= 0 && daysOverdue < 3) {
        greetingMessage = "Just a quick reminder 😊";
      } else if (daysOverdue >= 3 && daysOverdue < 7) {
        greetingMessage = "Following up on the invoice. Let me know if you need anything!";
      } else if (daysOverdue >= 7) {
        greetingMessage = "This is a final reminder regarding the pending payment.";
      }

      const clientEmail = invoice.clients?.email;
      const paymentLink = invoice.payment_link;

      // ईमेल भेजें अगर मैसेज, ईमेल और पेमेंट लिंक तीनों मौजूद हों
      if (clientEmail && paymentLink && greetingMessage) {
        const htmlTemplate = `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
            <p>Hi,</p>
            <p>${greetingMessage}</p>
            <p>You can complete the payment here:</p>
            <div style="margin: 25px 0;">
              <a href="${paymentLink}" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Pay Invoice Online
              </a>
            </div>
            <p style="font-size: 13px; color: #666;">Or copy this link in your browser: <br/> <a href="${paymentLink}">${paymentLink}</a></p>
            <br/>
            <p>Thanks!</p>
          </div>
        `;

        await sendReminder({
          to: clientEmail,
          subject: "Invoice Payment Reminder",
          html: htmlTemplate
        });
        
        emailsSent++;
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error) {
    console.error("Reminder Engine Error:", error.message);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}