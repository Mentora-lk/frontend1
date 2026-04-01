import { ReactNode } from "react";

type FilterGroupProps = {
  label: string;
  children: ReactNode;
};

export default function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <section style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 8,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </label>
      {children}
    </section>
  );
}
