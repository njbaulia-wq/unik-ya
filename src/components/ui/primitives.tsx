import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

/** Primitif UI gaya shadcn: netral, border halus, radius moderat (8px). */

type BtnVariant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-700",
    secondary: "border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400",
    ghost: "text-zinc-700 hover:bg-zinc-100",
  };
  return <button {...props} className={`${base} ${styles[variant]} ${props.className ?? ""}`} />;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "verified" | "new" }) {
  const styles: Record<string, string> = {
    neutral: "border border-zinc-300 text-zinc-700",
    verified: "bg-emerald-700 text-white",
    new: "bg-zinc-900 text-white",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-zinc-200 bg-white ${className}`}>{children}</div>;
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-zinc-300 px-3 py-2 text-sm ${props.className ?? ""}`}
    />
  );
}
