import React from "react";

const inputBase = [
  "w-full",
  "px-3 py-2.5",
  "rounded-xl",
  "border border-gray-200 dark:border-gray-700",
  "bg-white dark:bg-gray-800",
  "text-gray-900 dark:text-gray-100 text-base",
  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
  "shadow-sm",
  "transition",
].join(" ");

export function Label({ children, required }) {
  return (
    <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
      {children}
      {required && <span className="text-brand-600 dark:text-brand-400"> *</span>}
    </label>
  );
}

export function Help({ children }) {
  return <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{children}</p>;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={`${inputBase} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function NumberInput({ className = "", ...rest }) {
  return <input type="number" className={`${inputBase} ${className}`} {...rest} />;
}
