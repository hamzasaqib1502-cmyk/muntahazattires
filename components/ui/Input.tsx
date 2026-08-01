import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-widest text-gray-500"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
