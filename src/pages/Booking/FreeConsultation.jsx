// /src/pages/booking/FreeConsultation.jsx
import React from "react";
import CPLogo from "../../../public/images/logo/logoos.jpg"; // ✅ logo path

export default function FreeConsultation() {
  const CP_BLUE = "#122A56";
  const CP_WHITE = "#FFFFFF";

  // === Cal.com public event URL (from your dashboard) ===
  const PUBLIC_EVENT_URL = "https://cal.com/cp-6n2f3g/cp-pto";

  const params = new URLSearchParams({
    embed: "true",
    layout: "month_view",
    theme: "light",           // keep white theme
    language: "en",
    timezone: "Africa/Cairo",
    primaryColor: CP_BLUE.replace("#", ""), // hex without '#'
    hideEventTypeDetails: "0",
  }).toString();

  const src = `${PUBLIC_EVENT_URL}?${params}`;

  return (
    <div style={{ minHeight: "100vh", background: CP_WHITE }}>
      {/* ===== Hero Section ===== */}
      <section className="border-b" style={{ borderColor: "#E6ECF4" }}>
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: CP_BLUE }}>
                Free Consultation
              </h1>
              <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: "#4A5A73" }}>
                Let's talk about your goals, project challenges, and how we can help.
                Book a free consultation with our Cathodic Protection specialists and take
                the first step toward reliable corrosion solutions.
              </p>
            </div>

            {/* ✅ CP logo badge */}
            {/* <div className="hidden sm:flex items-center gap-3">
              <img
                src={CPLogo}
                alt="CP Design Pro"
                loading="lazy"
                className="h-24 w-24 rounded-full object-cover"
                style={{
                  border: "1px solid #E6ECF4",
                  boxShadow: "0 2px 8px rgba(18,42,86,0.08)",
                }}
              />
            </div> */}
          </div>
        </div>

      </section>

      {/* ===== Booking Section ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ background: CP_WHITE, border: "1px solid #E6ECF4" }}
          >
            {/* top accent */}
            <div style={{ height: 6, width: "100%", background: CP_BLUE }} />

            <div className="p-4 sm:p-6 lg:p-8">
              <iframe
                title="Free Consultation – CP Design Pro"
                src={src}
                className="w-full"
                style={{
                  height: 780,
                  border: "0",
                  borderRadius: 12,
                  boxShadow: "inset 0 0 0 1px #EEF3F9",
                }}
                allow="clipboard-write; microphone; camera"
              />
              <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "#4A5A73" }}>
                <span>Times are shown in your local timezone.</span>
                <a
                  href={PUBLIC_EVENT_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: CP_BLUE, textDecoration: "underline" }}
                >
                  Open in a separate window
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp Floating Button (optional) */}
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noreferrer"
            className="fixed z-40 right-4 bottom-4 inline-flex h-12 w-12 items-center justify-center rounded-full shadow-md"
            style={{ background: "#25D366", color: CP_WHITE }}
            title="Chat on WhatsApp"
          >
            ✆
          </a>
        </div>
      </section>

    </div>
  );
}
