/**
 * Utility to prevent Mass Assignment vulnerability by safely picking only allowed fields
 * from user-supplied request bodies.
 */

// Protected keys that must NEVER be mutated via uncontrolled client requests
export const PROTECTED_SYSTEM_FIELDS = [
  "role",
  "roles",
  "is_admin",
  "isAdmin",
  "is_subscriber",
  "isSubscriber",
  "subscription_status",
  "subscriptionStatus",
  "payment_status",
  "verified",
  "is_verified",
  "balance",
  "created_at",
  "updated_at",
];

/**
 * Picks allowed fields from an input object, stripping any protected system fields or unexpected parameters.
 */
export function pickAllowedFields<T extends Record<string, any>>(
  inputObj: any,
  allowedKeys: string[]
): Partial<T> {
  if (!inputObj || typeof inputObj !== "object" || Array.isArray(inputObj)) {
    return {};
  }

  const sanitizedResult: Partial<T> = {};

  for (const key of allowedKeys) {
    if (PROTECTED_SYSTEM_FIELDS.includes(key)) {
      continue; // Skip protected system field
    }
    if (Object.prototype.hasOwnProperty.call(inputObj, key) && inputObj[key] !== undefined) {
      sanitizedResult[key as keyof T] = inputObj[key];
    }
  }

  return sanitizedResult;
}
