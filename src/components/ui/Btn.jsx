// /src/components/ui/Btn.jsx
import React from "react";

export default function Btn({
  children,
  onClick,
  type = "button",
  variant = "outline",
  size = "xs",
  disabled = false,
  className = "",
  href,
  target,
  rel,
}) {
  const base = "rounded-full border transition inline-flex items-center justify-center";
  const sizes = {
    xs: "text-sm px-3 py-1.5",
    sm: "text-sm px-4 py-2",
    md: "text-base px-5 py-2.5",
  };
  const variants = {
    primary: "border-[#122A56] text-white bg-[#122A56] hover:opacity-90",
    outline: "border-[#122A56] text-[#122A56] bg-white hover:bg-gray-50",
    danger: "border-rose-300 text-rose-700 hover:bg-rose-50",
    neutral: "border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const cls = `${base} ${sizes[size] || sizes.xs} ${variants[variant] || variants.outline} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
