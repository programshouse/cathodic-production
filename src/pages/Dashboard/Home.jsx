// /src/pages/home/Home.jsx  (your file path may differ)
import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";

export default function Home() {
  return (
    <PageLayout title="Dashboard | CP">
      <PageHeader 
        title="Professional Cathodic Protection Calculator"
        description=" "
      />

      <div className="col-span-12 space-y-1 xl:col-span-12">
        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/pages/history" className="block group">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-5 hover:shadow-sm transition">
              <div className="text-sm uppercase tracking-wide text-gray-500 mb-1">Navigation</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">User History</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your recent calculations and resume quickly.</div>
            </div>
          </Link>

          {/* NEW: Library (Admin) */}
          <Link to="/pages/lib" className="block group">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-5 hover:shadow-sm transition">
              <div className="text-sm uppercase tracking-wide text-gray-500 mb-1">Admin</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Library</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload, manage, and share common reference files.</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="col-span-12">
        {/* other widgets */}
      </div>
    </PageLayout>
  );
}
