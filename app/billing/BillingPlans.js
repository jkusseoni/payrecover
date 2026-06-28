"use client";

import { useState } from "react";
import { plans } from "./plans";
import PaymentButton from "./PaymentButton";

export default function BillingPlans() {
  const [currencyMode, setCurrencyMode] = useState("IN");

  return (
    <div>
      <div
        style={{
          display: "inline-flex",
          padding: 4,
          borderRadius: 10,
          backgroundColor: "#f4f4f5",
          marginBottom: 32,
        }}
      >
        <button
          type="button"
          onClick={() => setCurrencyMode("IN")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            backgroundColor: currencyMode === "IN" ? "#4f46e5" : "transparent",
            color: currencyMode === "IN" ? "white" : "#52525b",
          }}
        >
          India (INR)
        </button>
        <button
          type="button"
          onClick={() => setCurrencyMode("INTL")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            backgroundColor: currencyMode === "INTL" ? "#4f46e5" : "transparent",
            color: currencyMode === "INTL" ? "white" : "#52525b",
          }}
        >
          International (USD)
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              position: "relative",
              padding: 24,
              borderRadius: 16,
              border: plan.featured ? "2px solid #4f46e5" : "1px solid #e4e4e7",
              backgroundColor: "white",
              boxShadow: plan.featured
                ? "0 8px 30px rgba(79, 70, 229, 0.12)"
                : "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {plan.featured && (
              <span
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                Most Popular
              </span>
            )}

            <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>{plan.name}</h2>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              {currencyMode === "IN" ? plan.approxInr : plan.usdPrice}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#71717a",
                  marginLeft: 6,
                }}
              >
                /month
              </span>
            </p>
            {currencyMode === "IN" && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#71717a" }}>
                Approx. {plan.usdPrice} USD
              </p>
            )}

            <ul
              style={{
                margin: "20px 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  style={{ fontSize: 14, color: "#3f3f46", lineHeight: 1.5 }}
                >
                  ✓ {feature}
                </li>
              ))}
            </ul>

            <PaymentButton
              currencyMode={currencyMode}
              razorpayLink={plan.razorpayLink}
              paypalLink={plan.paypalLink}
              featured={plan.featured}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
