// /src/pages/Users/UsersPage.jsx
import React, { useEffect } from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useuserstore } from "../../stores/useUsersStore.js";
import { Trash2 } from "lucide-react";

export default function UsersPage() {
  const { users, loading, error, getUsers, deleteUser } = useuserstore();

  // Fetch users on mount
  useEffect(() => {
    getUsers().catch((err) => {
      console.error("Failed to fetch users", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    getUsers().catch((err) => {
      console.error("Failed to fetch users", err);
    });
  };

  const handleDelete = async (id, nameOrEmail) => {
    if (!id) return;

    const label = nameOrEmail || `ID ${id}`;
    const ok = window.confirm(
      `Are you sure you want to delete user "${label}"?`
    );
    if (!ok) return;

    try {
      await deleteUser(id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.message || "Failed to delete user.");
    }
  };

  // ✅ plan comes from backend as "free" or "pro"
  const getPlanLabel = (u) => {
    const raw =
      (u?.plan_name || u?.plan || "").toString().trim().toLowerCase();

    if (raw.includes("pro")) return "Pro";
    if (raw.includes("free")) return "Free";

    // Fallback: derive from is_paid if needed
    if (u?.is_paid === 1 || u?.is_paid === true || u?.is_paid === "1") {
      return "Pro";
    }

    return "Free";
  };

  // ✅ Free → blue badge, Pro → yellow badge
  const getPlanBadgeClass = (label) => {
    const l = String(label || "").toLowerCase();

    if (l === "pro") {
      // Pro = yellow
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/70 dark:border-amber-700/70";
    }

    // Default & "Free" = blue
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200/70 dark:border-blue-700/70";
  };

  const totalUsers = users?.length || 0;

  return (
    <div className="p-5 md:p-6 space-y-5">
      <ModuleCard
        title={
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-semibold">Users</span>
            {totalUsers > 0 && (
              <span className="text-xs md:text-sm font-normal text-gray-500 dark:text-gray-400">
                Total:{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {totalUsers}
                </span>
              </span>
            )}
          </div>
        }
        subtitle={
          <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            View all registered users and manage their access.
          </span>
        }
        actions={
          <PrimaryButton
            type="button"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm md:text-base px-4 py-1.5"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </PrimaryButton>
        }
      >
        {/* Error message */}
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm md:text-base text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !users?.length && (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm md:text-base text-gray-500 dark:text-gray-400">
            <div className="h-5 w-5 md:h-6 md:w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            <span>Loading users…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && (!users || users.length === 0) && !error && (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-sm md:text-base text-gray-500 dark:text-gray-400">
            <span className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-200">
              No users found
            </span>
            <p className="max-w-sm text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
              When new users sign up, they will appear here. You can refresh to
              check for the latest list.
            </p>
            <PrimaryButton
              type="button"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="mt-2 text-sm md:text-base px-4 py-1.5"
            >
              Refresh
            </PrimaryButton>
          </div>
        )}

        {/* Users table */}
        {users && users.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="min-w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60">
                  <th className="px-4 py-2.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Plan
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const id = u.id ?? u.user_id ?? u._id;

                  const fullName = [u.first_name, u.last_name]
                    .filter(Boolean)
                    .join(" ");

                  const name = u.name ?? (fullName || "-");
                  const email = u.email ?? u.username ?? "-";
                  const planLabel = getPlanLabel(u);

                  const rowBg =
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50/70 dark:bg-gray-900/60";

                  return (
                    <tr
                      key={id || email || idx}
                      className={`${rowBg} border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/70 transition-colors`}
                    >
                      <td className="px-4 py-2.5 align-middle text-gray-800 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs md:text-sm font-semibold text-brand-700 dark:bg-brand-900/60 dark:text-brand-100 uppercase">
                            {String(name || email || "?")
                              .trim()
                              .charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-medium">
                              {name}
                            </span>
                            {u.role && (
                              <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                                {String(u.role).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 align-middle text-gray-700 dark:text-gray-200">
                        <span className="text-xs md:text-sm font-mono dark:bg-gray-800/80 px-2 py-0.5 rounded-md">
                          {email}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-middle text-gray-700 dark:text-gray-200">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs md:text-sm font-semibold ${getPlanBadgeClass(
                            planLabel
                          )}`}
                        >
                          {planLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(id, name || email)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1 text-xs md:text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700/60 dark:text-red-200 dark:hover:bg-red-900/40 disabled:opacity-60"
                          disabled={loading || !id}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ModuleCard>
    </div>
  );
}
