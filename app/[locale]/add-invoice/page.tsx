"use client";
import { useState, type FormEvent } from "react";

export default function AddInvoice() {
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    amount: "",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // फ़ॉर्म को रीलोड होने से रोकने के लिए
    
    if (!form.client_email || !form.amount || !form.due_date) {
      alert("कृपया सभी ज़रूरी फ़ील्ड्स भरें!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/add-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Invoice Added Successfully! 🎉");
        // फ़ॉर्म रीसेट करें
        setForm({ client_name: "", client_email: "", amount: "", due_date: "" });
      } else {
        alert(`Error: ${data.error || 'Failed to add invoice'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: '400px' }}>
      <h1 style={{ marginBottom: 20 }}>Add New Invoice</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Client Name</label>
          <input 
            type="text"
            placeholder="John Doe"
            value={form.client_name}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={e => setForm({...form, client_name: e.target.value})} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Client Email *</label>
          <input 
            type="email"
            placeholder="client@example.com"
            value={form.client_email}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={e => setForm({...form, client_email: e.target.value})} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount ($) *</label>
          <input 
            type="number"
            placeholder="500"
            value={form.amount}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={e => setForm({...form, amount: e.target.value})} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Due Date *</label>
          <input 
            type="date"
            value={form.due_date}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={e => setForm({...form, due_date: e.target.value})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            border: 'none', 
            backgroundColor: loading ? '#ccc' : '#2563eb', 
            color: 'white', 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Adding..." : "Add Invoice"}
        </button>
      </form>
    </div>
  );
}