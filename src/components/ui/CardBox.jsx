import React from "react";

const CardBox = ({ children, className = "" }) => {
  return (
    <div className={`col-span-12 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 ${className}`}>
      {children}
    </div>
  );
};

export default CardBox;
