// /src/pages/home/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { History, Folder, Calendar } from "lucide-react";

// Recharts imports
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      to: "/pages/history",
      label: "Navigation",
      title: "User History",
      desc: "View your recent calculations and resume quickly.",
      icon: <History className="h-8 w-8 text-[#0b2850]" />,
      buttonText: "Enter History",
    },
    {
      to: "/pages/lib",
      label: "Admin",
      title: "Library",
      desc: "Upload, manage, and share common reference files.",
      icon: <Folder className="h-8 w-8 text-[#0b2850]" />,
      buttonText: "Enter Library",
    },
    {
      to: "/pages/booking",
      label: "Booking",
      title: "Free Consultation",
      desc: "Book a 30-minute Google Meet to discuss your project.",
      icon: <Calendar className="h-8 w-8 text-[#0b2850]" />,
      buttonText: "Book Now",
    },
  ];

  // Demo data for the chart (front-only)
  const happyClientsData = [
    { month: "Jan", value: 72, baseline: 68 },
    { month: "Feb", value: 70, baseline: 71 },
    { month: "Mar", value: 75, baseline: 73 },
    { month: "Apr", value: 78, baseline: 75 },
    { month: "May", value: 80, baseline: 77 },
    { month: "Jun", value: 84, baseline: 79 },
    { month: "Jul", value: 86, baseline: 80 },
    { month: "Aug", value: 90, baseline: 82 },
    { month: "Sep", value: 82, baseline: 81 },
    { month: "Oct", value: 88, baseline: 83 },
    { month: "Nov", value: 86, baseline: 84 },
    { month: "Dec", value: 89, baseline: 85 },
  ];

  return (
    <section title="Dashboard | CP">
      {/* <PageHeader
        title="Professional Cathodic Protection Calculator"
        description=""
      /> */}

      {/* MAIN CARDS */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-4">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.to)}
            role="button"
            tabIndex={0}
            className="group flex flex-col justify-between rounded-2xl 
                       border border-gray-300 dark:border-gray-800 
                       bg-white dark:bg-[#0f172a]/60
                       p-7 min-h-[230px] cursor-pointer
                       hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            {/* ICON */}
            <div className="mb-4">{card.icon}</div>

            {/* LABEL */}
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              {card.label}
            </div>

            {/* TITLE */}
            <div className="text-xl font-semibold text-[#0b2850] dark:text-white flex items-center justify-between">
              {card.title}
              <span className="opacity-0 group-hover:opacity-100 transition text-[#0b2850] text-sm">
                →
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {card.desc}
            </p>

            {/* BUTTON */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.to);
                }}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                           bg-[#0b2850] text-white hover:bg-[#13376a]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2850]"
              >
                {card.buttonText}
                <span className="ml-2 text-xs">↗</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Happy Clients LINE CHART (UI CHART) */}
      <div className="mt-10 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Happy Clients
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Demo chart showing a line trend with baseline comparison.
        </p>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={happyClientsData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              {/* Baseline dotted line */}
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
              {/* Main solid line with dots */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4338ca"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
