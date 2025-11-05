import React from "react";

const BRAND = {
  primary: "#5b8def",
  accent:  "#845ef7",
  hover:   "#4779ea",
};

export default function HeaderBanner({
  title = "Professional Cathodic Protection Calculator",
  subtitle = 'Created by Eng. Islam Saleh “AMPP NACE CP 3 Technologist”',
  phone = "(+20) 1113718843",
  email = "islam.saleh30@yahoo.com",
  rightActions = null, // e.g. <button className="btn">Docs</button>
}) {
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
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-semibold tracking-tight
                               text-slate-900 dark:text-slate-100">
                  {title}
                </h1>

                {/* Version chip */}

              </div>

              {/* Optional right actions (align with dashboard header buttons if needed) */}
              {rightActions && (
                <div className="shrink-0 flex items-center gap-2">
                  {rightActions}
                </div>
              )}
            </div>

            {/* Subtitle */}
            <p className="mt-1 text-[11px] md:text-sm leading-relaxed
                          text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>

            {/* Contacts */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3
                            text-[11px] md:text-[13px]">
              {/* Phone */}
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 transition-colors"
                style={{ color: BRAND.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.primary)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.62 2.5a2 2 0 0 1-.45 2.11L9.09 10.9a16 16 0 0 0 4 4l1.58-1.18a2 2 0 0 1 2.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0 1 22 16.92Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="tabular-nums">{phone}</span>
              </a>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 transition-colors break-all"
                style={{ color: BRAND.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.primary)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm16 0-8 7L4 6"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                {email}
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle top highlight to match your dashboard sheen */}
      <div
        className="pointer-events-none absolute -top-24 right-10 h-48 w-48 rounded-full blur-3xl opacity-30"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary}55, ${BRAND.accent}55)` }}
      />
    </section>
  );
}
