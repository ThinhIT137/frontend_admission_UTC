"use client";

/** Keep technical failures out of rendered UI. Never log form values, tokens or request bodies. */
export function publicError(error: unknown, message = "Thao tác thất bại. Vui lòng thử lại."): string {
  void error; // Never log arbitrary upstream exceptions, form values or credentials.
  return message;
}
