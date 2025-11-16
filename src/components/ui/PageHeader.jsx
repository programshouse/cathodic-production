import React from "react";

const PageHeader = ({
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <div className={`col-span-12 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-600 tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-base text-brand-400 mt-1">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0 flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;
