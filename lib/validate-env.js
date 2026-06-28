export function getMissingEnvVars(names) {
  return names.filter((name) => !process.env[name]?.trim());
}

export function validateInvoiceSetupEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missing = getMissingEnvVars(required);

  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing environment variables: ${missing.join(", ")}`,
      missing,
    };
  }

  return { ok: true };
}

export function validatePaymentLinkEnv() {
  const required = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
  const missing = getMissingEnvVars(required);

  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing environment variables: ${missing.join(", ")}`,
      missing,
    };
  }

  return { ok: true };
}

export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.cause
      ? `${error.message} (cause: ${getErrorMessage(error.cause)})`
      : error.message;
  }

  if (error && typeof error === "object") {
    const razorpayError = error.error;
    if (razorpayError && typeof razorpayError === "object") {
      if (razorpayError.description) {
        const status = error.statusCode ? ` [HTTP ${error.statusCode}]` : "";
        const reason = razorpayError.reason ? ` — ${razorpayError.reason}` : "";
        return `${razorpayError.description}${reason}${status}`;
      }
      if (razorpayError.code) {
        return `${razorpayError.code}${error.statusCode ? ` [HTTP ${error.statusCode}]` : ""}`;
      }
    }

    if ("message" in error && error.message) {
      return String(error.message);
    }

    if ("description" in error && error.description) {
      return String(error.description);
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }

  return String(error ?? "Unknown error");
}
