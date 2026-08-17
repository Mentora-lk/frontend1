/**
 * Shared field validation rules.
 *
 * Password rules live here (not inside each form) so signup and password
 * reset enforce exactly the same thing — the backend rejects weak passwords
 * on its own, but only after a round trip, so we check the same rules
 * client-side and show them as the user types.
 */

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /\d/.test(p) },
  { id: "symbol", label: "One symbol (e.g. !?@#$)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export type PasswordRuleResult = PasswordRule & { met: boolean };

export function checkPassword(password: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/**
 * First unmet rule as a submit-time error message, or "" when the password
 * (and its confirmation, if given) is acceptable.
 */
export function getPasswordError(password: string, confirmPassword?: string): string {
  if (!password) return "Please enter a password";

  const unmet = PASSWORD_RULES.find((rule) => !rule.test(password));
  if (unmet) return `Password must contain: ${unmet.label.toLowerCase()}`;

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "Passwords do not match";
  }

  return "";
}
