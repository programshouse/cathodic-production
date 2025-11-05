import React from "react";

const BRAND = {
  primary: "#5b8def", // main brand
  accent:  "#845ef7", // secondary brand
  primaryHover: "#4779ea",
  primaryDark: "#8aa9ff",
};

export default function HeaderBanner() {
  return (
    <section
      className="
        relative overflow-hidden rounded-2xl border
        border-slate-200/70 dark:border-slate-800
        bg-white dark:bg-slate-950
        shadow-sm
      "
      aria-label="Professional Cathodic Protection Calculator"
    >
      {/* Brand gradient background */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-80
        "
        style={{
          background:
            `radial-gradient(1200px 600px at -20% -40%, ${BRAND.primary}26, transparent 60%),
             radial-gradient(900px 500px at 120% 10%, ${BRAND.accent}26, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative px-5 py-4 md:px-7 md:py-5">
        <div className="flex items-start gap-4 md:gap-5">
          {/* Text */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base md:text-lg font-semibold tracking-tight text-brand-600 dark:text-slate-100">
                Professional Cathodic Protection Calculator
              </h1>

            </div>

            <p className="text-[11px] md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Created by <span className="font-medium">Eng. Islam Saleh</span>{" "}
              <span className="opacity-80">“AMPP NACE CP 3 Technologist”</span>
            </p>

            {/* Contact row — icons & text use brand color and are clickable */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[11px] md:text-[13px]">
              <a
                href="tel:+201113718843"
                className="inline-flex items-center gap-1.5 transition-colors"
                style={{ color: BRAND.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.primary)}
              >
                {/* Phone icon (brand-colored) */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  style={{ opacity: 0.9 }}
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.62 2.5a2 2 0 0 1-.45 2.11L9.09 10.9a16 16 0 0 0 4 4l1.58-1.18a2 2 0 0 1 2.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0 1 22 16.92Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="tabular-nums">(+20) 1113718843</span>
              </a>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>

              <a
                href="mailto:islam.saleh30@yahoo.com"
                className="inline-flex items-center gap-1.5 transition-colors break-all"
                style={{ color: BRAND.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.primary)}
              >
                {/* Email icon (brand-colored) */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  style={{ opacity: 0.9 }}
                >
                  <path
                    d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm16 0-8 7L4 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                islam.saleh30@yahoo.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
