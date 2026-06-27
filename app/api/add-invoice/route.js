import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { client_name, client_email, amount, due_date } = await request.json();

    // 1. पहले चेक करें कि क्लाइंट 'clients' टेबल में मौजूद है या नहीं
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', client_email)
      .single();

    let clientId = client?.id;

    if (!client) {
      // अगर क्लाइंट नहीं है, तो नया क्लाइंट बनाएं (बग फिक्स: [0] इंडेक्स जोड़ा)
      const { data: newClient, error: cErr } = await supabase
        .from('clients')
        .insert([{ name: client_name || client_email.split('@')[0], email: client_email }])
        .select('id')
        .single();

      if (cErr) throw cErr;
      clientId = newClient.id;
    }

    // 2. इनवॉइस को 'pending' स्टेटस के साथ इंसर्ट करें ताकि 'invoice_id' जनरेट हो सके
    const { data: invoice, error: iErr } = await supabase
      .from('invoices')
      .insert([
        {
          client_id: clientId,
          amount: parseFloat(amount),
          due_date: due_date,
          status: 'pending'
        }
      ])
      .select('id')
      .single();

    if (iErr) throw iErr;

    // 3. 🔥 अपने 'create-payment-link' एंडपॉइंट को कॉल करें और 'invoice_id' पास करें
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const linkRes = await fetch(`${baseUrl}/api/create-payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        name: client_name,
        email: client_email,
        invoice_id: invoice.id // वेबहुक के लिए सबसे महत्वपूर्ण
      })
    });

    const linkData = await linkRes.json();

    if (!linkRes.ok) throw new Error(linkData.error || "Failed to create payment link");

    // 4. 💾 🔥 पेमेंट लिंक (link) और लिंक आईडी (link_id) दोनों को एक साथ डेटाबेस में अपडेट करें
    const { error: updateErr } = await supabase
      .from('invoices')
      .update({ 
        payment_link: linkData.link, 
        payment_link_id: linkData.link_id // 🎯 दोनों कॉलम अब एक साथ सेव हो रहे हैं
      })
      .eq('id', invoice.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ 
      success: true, 
      invoice_id: invoice.id, 
      payment_link: linkData.link,
      payment_link_id: linkData.link_id
    });

  } catch (error) {
    console.error("Invoice Setup Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}