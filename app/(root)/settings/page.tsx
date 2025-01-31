"use client";

import { LoaderCircle } from "lucide-react";
import { useTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

import { deleteUser } from "@/actions/user";

const SettingsPage = () => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteUser = () => {
    startTransition(() => {
      deleteUser();
    });
  };

  return (
    <>
      <header className="flex flex-col mb-6 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex items-center justify-between p-5 border rounded-xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">Delete account</h2>
          <p className="text-muted-foreground text-sm">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>
        <Button
          variant="destructive"
          type="submit"
          onClick={() => setIsOpen(true)}
          disabled={isPending}
        >
          Delete your account
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => handleDeleteUser()}
        title="Delete account"
        description="Are you sure you want to delete your account? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Confirm"
        variant="destructive"
      />
    </>
  );
};
export default SettingsPage;
