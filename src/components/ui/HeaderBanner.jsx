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
  phones = ["+201113718843", "+9647875690176"],
  emails = ["islam.saleh30@yahoo.com", "islam.saleh3030@gmail.com"],
  linkedin = "https://www.linkedin.com/in/islam-saleh-714323aa/",
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

            {/* Contacts */}
            {(() => {
              const listPhones =
                Array.isArray(phones) && phones.length
                  ? phones
                  : phone
                  ? [phone]
                  : [];
              const listEmails =
                Array.isArray(emails) && emails.length
                  ? emails
                  : email
                  ? [email]
                  : [];
              const hasLinkedIn = Boolean(linkedin);

              if (!listPhones.length && !listEmails.length && !hasLinkedIn) {
                return null;
              }

              return (
                <div
                  className="
                    mt-3
                    grid gap-3 md:gap-4
                    text-[11px] md:text-[13px]
                    sm:grid-cols-2 lg:grid-cols-3
                  "
                >
                  {/* Phones column */}
                  {listPhones.length > 0 && (
                    <div className="space-y-1.5 min-w-0">
                      <p
                        className="
                          text-[10px] uppercase tracking-[0.14em]
                          text-slate-500 dark:text-slate-400
                        "
                      >
                        Phone
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        {listPhones.map((ph, idx) => (
                          <React.Fragment key={`ph-${idx}`}>
                            {idx > 0 && (
                              <span className="mx-1 text-slate-400 dark:text-slate-500">
                                ||
                              </span>
                            )}
                            <a
                              href={`tel:${String(ph).replace(/[^\d+]/g, "")}`}
                              className="inline-flex items-center gap-1.5 transition-colors"
                              style={linkBaseStyle}
                              onMouseEnter={(e) => handleHover(e, true)}
                              onMouseLeave={(e) => handleHover(e, false)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.62 2.5a2 2 0 0 1-.45 2.11L9.09 10.9a16 16 0 0 0 4 4l1.58-1.18a2 2 0 0 1 2.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0 1 22 16.92Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="tabular-nums">{ph}</span>
                            </a>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emails column */}
                  {listEmails.length > 0 && (
                    <div className="space-y-1.5 min-w-0">
                      <p
                        className="
                          text-[10px] uppercase tracking-[0.14em]
                          text-slate-500 dark:text-slate-400
                        "
                      >
                        Email
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        {listEmails.map((em, idx) => (
                          <React.Fragment key={`em-${idx}`}>
                            {idx > 0 && (
                              <span className="mx-1 text-slate-400 dark:text-slate-500">
                                ||
                              </span>
                            )}
                            <a
                              href={`mailto:${em}`}
                              className="
                                inline-flex items-center gap-1.5
                                transition-colors break-all
                              "
                              style={linkBaseStyle}
                              onMouseEnter={(e) => handleHover(e, true)}
                              onMouseLeave={(e) => handleHover(e, false)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm16 0-8 7L4 6"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {em}
                            </a>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LinkedIn column */}
                  {hasLinkedIn && (
                    <div className="space-y-1.5 min-w-0">
                      <p
                        className="
                          text-[10px] uppercase tracking-[0.14em]
                          text-slate-500 dark:text-slate-400
                        "
                      >
                        LinkedIn
                      </p>
                      <div>
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 transition-colors"
                          style={linkBaseStyle}
                          onMouseEnter={(e) => handleHover(e, true)}
                          onMouseLeave={(e) => handleHover(e, false)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 1 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <rect
                              x="2"
                              y="9"
                              width="4"
                              height="12"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="4"
                              cy="4"
                              r="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <span className="truncate">View profile</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
