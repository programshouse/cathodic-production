import React from "react";

const BRAND = {
  primary: "#5b8def",
  accent:  "#845ef7",
  hover:   "#4779ea",
};

export default function HeaderBanner({
  title = "Professional Cathodic Protection Calculator",
  subtitle = 'Created by Eng. Islam Saleh “AMPP NACE CP 3 Technologist”',
  // Backward compat (single values)
  phone,
  email,
  // New: multi-contacts
  // phones = ["+201113718843", "+9647875690176"],
  // emails = ["islam.saleh30@yahoo.com", "islam.saleh3030@gmail.com"],
  // linkedin = "https://www.linkedin.com/in/islam-saleh-714323aa/",
  rightActions = null, // e.g. <button className="btn">Docs</button>
}) {
  const linkBaseStyle = { color: BRAND.primary };

  const handleHover = (e, isEnter) => {
    e.currentTarget.style.color = isEnter ? BRAND.hover : BRAND.primary;
  };

  return (
    <section
      className="
        relative overflow-hidden rounded-2xl
        border border-slate-200/70 dark:border-slate-800
        bg-white dark:bg-slate-950 shadow-sm
      "
      aria-label={title}
    >
      {/* Soft brand gradient wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(1100px 520px at -20% -40%, ${BRAND.primary}22, transparent 60%),
            radial-gradient(900px 480px at 120% 0%, ${BRAND.accent}22, transparent 60%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative px-5 py-4 md:px-7 md:py-5">
        <div className="flex items-start md:items-center gap-4 md:gap-6">

          {/* Left: identity + contacts */}
          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h1
                  className="
                    text-base md:text-lg font-semibold tracking-tight
                    text-slate-900 dark:text-slate-100
                    truncate
                  "
                >
                  {title}
                </h1>

                {/* Optional version chip */}
                {/* <span className="hidden sm:inline-flex items-center rounded-full
                                 bg-slate-900/5 px-2 py-0.5 text-[10px] font-medium
                                 text-slate-600 dark:bg-slate-50/5 dark:text-slate-300">
                  v2.0
                </span> */}
              </div>

              {/* Optional right actions */}
              {rightActions && (
                <div className="shrink-0 flex items-center gap-2">
                  {rightActions}
                </div>
              )}
            </div>

            {/* Subtitle */}
            <p
              className="
                mt-1 text-[11px] md:text-sm leading-relaxed
                text-slate-600 dark:text-slate-300
              "
            >
              {subtitle}
            </p>


          </div>
        </div>
      </div>

      {/* Subtle top highlight */}
      <div
        className="pointer-events-none absolute -top-24 right-10 h-48 w-48 rounded-full blur-3xl opacity-30"
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary}55, ${BRAND.accent}55)`,
        }}
      />
    </section>
  );
}
