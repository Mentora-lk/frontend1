// Common style constants for form components
export const FORM_COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  border: "#d1d5db",
  background: "#ffffff",
  text: "#111827",
  textMuted: "#9ca3af",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  lightBorder: "#e5e7eb",
  bgLight: "#f9fafb",
};

export const FORM_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Input/Select/Textarea base styles
export const getInputStyle = (
  hoveredField: string | null,
  fieldName: string,
  additionalStyles?: Record<string, any>
): React.CSSProperties => ({
  padding: "12px 16px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  border:
    hoveredField === fieldName
      ? `2px solid ${FORM_COLORS.primary}`
      : `1px solid ${FORM_COLORS.border}`,
  borderRadius: 14,
  background: FORM_COLORS.background,
  outline: "none",
  transition: "all 0.3s ease",
  boxShadow:
    hoveredField === fieldName
      ? `0 0 0 3px rgba(16, 185, 129, 0.1)`
      : "none",
  ...additionalStyles,
});

// Static input styles (without hover effects)
export const getStaticInputStyle = (
  additionalStyles?: Record<string, any>
): React.CSSProperties => ({
  padding: "12px 16px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  border: `1px solid ${FORM_COLORS.border}`,
  borderRadius: 14,
  background: FORM_COLORS.background,
  outline: "none",
  ...additionalStyles,
});

// Select-specific styles (adds cursor pointer and color)
export const getSelectStyle = (
  hoveredField: string | null,
  fieldName: string,
  isSelected: boolean,
  additionalStyles?: Record<string, any>
): React.CSSProperties => ({
  ...getInputStyle(hoveredField, fieldName),
  cursor: "pointer",
  color: isSelected ? FORM_COLORS.text : FORM_COLORS.textMuted,
  ...additionalStyles,
});

// Label styles
export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

// Form container styles
export const formContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  fontFamily: "'DM Sans', sans-serif",
};

export const formSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

export const formGridStyle = (columns: number = 2): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: 16,
});

// Primary Button styles
export const getPrimaryButtonStyle = (
  disabled: boolean = false
): React.CSSProperties => ({
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  color: "white",
  background: !disabled
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : FORM_COLORS.lightGray,
  border: "none",
  borderRadius: 14,
  cursor: disabled ? "not-allowed" : "pointer",
  marginTop: 12,
  transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
  boxShadow: !disabled ? "0 4px 15px rgba(16, 185, 129, 0.3)" : "none",
});

// Secondary Button styles
export const getSecondaryButtonStyle = (
  disabled: boolean = false,
  isActive: boolean = false
): React.CSSProperties => ({
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  color: disabled ? FORM_COLORS.textMuted : FORM_COLORS.primary,
  background: disabled ? FORM_COLORS.lightGray : "white",
  border: disabled
    ? `1px solid ${FORM_COLORS.border}`
    : `2px solid ${FORM_COLORS.primary}`,
  borderRadius: 14,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s ease",
});

// File upload area styles
export const fileUploadAreaStyle: React.CSSProperties = {
  border: `2px dashed ${FORM_COLORS.primary}`,
  borderRadius: 16,
  padding: 32,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

// Card/Box styles
export const cardStyle: React.CSSProperties = {
  border: `1px solid ${FORM_COLORS.lightBorder}`,
  borderRadius: 16,
  padding: 16,
  background: FORM_COLORS.background,
};

export const cardLightStyle: React.CSSProperties = {
  border: `1px solid ${FORM_COLORS.lightBorder}`,
  borderRadius: 16,
  padding: 16,
  background: FORM_COLORS.bgLight,
};

// Button hover effects
export const handleButtonHoverEnter = (
  e: React.MouseEvent<HTMLButtonElement>,
  primaryButton: boolean = true
) => {
  const button = e.target as HTMLButtonElement;
  if (primaryButton) {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)";
  }
};

export const handleButtonHoverLeave = (
  e: React.MouseEvent<HTMLButtonElement>,
  primaryButton: boolean = true
) => {
  const button = e.target as HTMLButtonElement;
  if (primaryButton) {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
  }
};

// Link hover effects
export const handleLinkHoverEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
  (e.target as HTMLAnchorElement).style.color = FORM_COLORS.primaryDark;
};

export const handleLinkHoverLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
  (e.target as HTMLAnchorElement).style.color = FORM_COLORS.primary;
};
