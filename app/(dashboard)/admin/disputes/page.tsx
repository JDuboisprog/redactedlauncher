import { listAllDisputes } from "@/lib/disputes";
import { getCurrentUser } from "@/lib/auth";
import { AdminDisputesTable } from "@/components/admin/disputes-table";

export default async function AdminDisputesPage() {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  if (user.role !== "admin") {
    return null;
  }
  const disputes = await listAllDisputes();

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Dispute resolution
        </h1>
        <p className="text-sm text-gray-600">
          Approve refunds or releases after reviewing both sides.
        </p>
      </div>
      <AdminDisputesTable disputes={disputes} />
    </div>
  );
}

