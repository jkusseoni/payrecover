// 1. अपने plans एरे में लिंक्स अपडेट करें:
const plans = [
  {
    name: "Basic",
    usdPrice: "$4.90",
    approxInr: "₹449",
    features: ["Limited payment tracking", "Email notifications", "Basic Dashboard access"],
    razorpayLink: https://rzp.io/rzp/wVjd0Emj,
    paypalLink: https://www.paypal.com/ncp/payment/4G2NGAFWBYZ48 // 🔗 यहाँ पेपाल का लिंक डालें
  },
  {
    name: "Professional",
    usdPrice: "$9.90",
    approxInr: "₹899",
    features: ["Unlimited payment tracking", "Automated Webhook alerts", "Priority Email alerts", "Complete Dashboard access"],
    featured: true,
    razorpayLink: https://rzp.io/rzp/ZPemaWLS,
    paypalLink: https://www.paypal.com/ncp/payment/PBD83KM93TGEJ // 🔗 यहाँ पेपाल का लिंक डालें
  },
  {
    name: "Ultimate",
    usdPrice: "$14.90",
    approxInr: "₹1399",
    features: ["Everything in Professional", "Custom domain integrations", "24/7 Dedicated Support", "Advanced automation rules"],
    razorpayLink: https://rzp.io/rzp/lfz7DEQz,
    paypalLink: https://www.paypal.com/ncp/payment/XDLU8TPQGHW5Q // 🔗 यहाँ पेपाल का लिंक डालें
  }
];

// 2. नीचे बटन वाले UI सेक्शन को इस कोड से बदलें:
const handleRedirect = (link) => {
  window.location.href = link;
};

// बटन की जगह पर इसे डालें:
{currencyMode === "IN" ? (
  <button
    onClick={() => handleRedirect(plan.razorpayLink)}
    style={{ width: "100%", padding: "12px", backgroundColor: plan.featured ? "#4f46e5" : "#111827", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
  >
    Buy with Razorpay 💳
  </button>
) : (
  <button
    onClick={() => handleRedirect(plan.paypalLink)}
    style={{ width: "100%", padding: "12px", backgroundColor: "#ffc439", color: "#003087", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
  >
    Buy with PayPal 🟡
  </button>
)}