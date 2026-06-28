"use client";

function handleRedirect(link) {
  window.location.href = link;
}

export default function PaymentButton({
  currencyMode,
  razorpayLink,
  paypalLink,
  featured = false,
}) {
  if (currencyMode === "IN") {
    return (
      <button
        type="button"
        onClick={() => handleRedirect(razorpayLink)}
        style={{
          width: "100%",
          padding: 12,
          backgroundColor: featured ? "#4f46e5" : "#111827",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Buy with Razorpay
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => handleRedirect(paypalLink)}
      style={{
        width: "100%",
        padding: 12,
        backgroundColor: "#ffc439",
        color: "#003087",
        border: "none",
        borderRadius: 10,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Buy with PayPal
    </button>
  );
}
