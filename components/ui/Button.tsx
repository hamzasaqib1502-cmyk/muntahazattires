import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-gray-800",
  secondary: "border border-black text-black bg-transparent hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
