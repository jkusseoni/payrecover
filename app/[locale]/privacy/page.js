export default function PrivacyPage() {
    return (
      <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif", color: "#333", lineHeight: "1.6" }}>
        <h1>Privacy Policy</h1>
        <p>At PayRecover, we value your privacy. This policy explains how we collect, protect, and use your data.</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect your login email via Supabase Auth. We also securely store invoice metadata, amounts, and statuses required to execute payment reminders.</p>
        
        <h2>2. Data Security</h2>
        <p>Your database records are isolated based on your user identity. Payment data is processed directly via securing industry-standard tokenization protocols by Razorpay; we do not store your raw bank credentials or full card details.</p>
        
        <h2>3. Third-Party Services</h2>
        <p>We use Supabase for data hosting and authentication, and Razorpay for payment processing. Your data is only shared with these platforms to facilitate our core SaaS services.</p>
        
        <p><em>Last updated: June 2026</em></p>
      </div>
    );
  }