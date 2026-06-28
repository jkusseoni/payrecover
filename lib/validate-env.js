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

export function sanitizeEnvValue(value) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

export function getRazorpayCredentials() {
  const envCheck = validatePaymentLinkEnv();
  if (!envCheck.ok) {
    throw new Error(envCheck.error);
  }

  const keyId = sanitizeEnvValue(process.env.RAZORPAY_KEY_ID);
  const keySecret = sanitizeEnvValue(process.env.RAZORPAY_KEY_SECRET);

  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
    throw new Error(
      "Invalid RAZORPAY_KEY_ID. Use Key ID from Razorpay Dashboard → Account & Settings → API Keys (starts with rzp_test_ or rzp_live_)."
    );
  }

  if (keySecret.length < 16) {
    throw new Error(
      "Invalid RAZORPAY_KEY_SECRET. Copy the full Key Secret from the same API key pair in Razorpay Dashboard."
    );
  }

  return { keyId, keySecret };
}

export function formatRazorpayAuthHelp(statusCode) {
  if (statusCode !== 401) return "";

  return (
    " Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel (Production) " +
    "are from the same key pair in Razorpay Dashboard → Account & Settings → API Keys. " +
    "If you regenerated keys, update Vercel and redeploy."
  );
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
