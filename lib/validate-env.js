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

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error ?? "Unknown error");
}
