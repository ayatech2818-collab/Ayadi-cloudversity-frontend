"use client";

import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import { logout } from "@/lib/api/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutDialogProps {
  open: boolean;
  onCancel: () => void;
}

export default function LogoutDialog({
  open,
  onCancel,
}: LogoutDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await logout();

      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  return (
    <DeleteDialog
      open={open}
      id="logout-dialog-title"
      title="Logout from admin?"
      description={
        <>
          Are you sure you want to logout from the admin panel?
          You will need to sign in again to access your dashboard.
        </>
      }
      loading={loading}
      confirmLabel="Logout"
      onCancel={onCancel}
      onConfirm={handleLogout}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-page p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
          <LogOut className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-medium text-text">
            Sign out of Ayadi Admin
          </p>

          <p className="mt-0.5 text-xs text-muted">
            Your current admin session will be ended.
          </p>
        </div>
      </div>
    </DeleteDialog>
  );
}