"use client";
import { useState } from "react";
import { signIn } from "@/lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // अगर फॉर्म यूज़ करें तो रीलोड रोकने के लिए
    if (!email) return alert("Please enter your email first");

    setLoading(true);
    const { error } = await signIn(email);
    setLoading(false);

    if (error) {
      alert(`Error: ${error}`);
    } else {
      alert("✨ Check your email for login link!");
      setEmail(""); // इनपुट बॉक्स खाली करने के लिए
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 400, margin: "0 auto" }}>
      <h1>Login</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        We will send a magic link to your email for passwordless login.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Enter email (e.g., name@example.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />

        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#a5b4fc" : "#4f46e5",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Sending..." : "Send Magic Link 🚀"}
        </button>
      </div>
    </div>
  );
}