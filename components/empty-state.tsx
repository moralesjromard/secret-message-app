"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  redirectLink?: string;
  redirectLabel?: string;
}

export const EmptyState = ({
  title = "No data",
  subtitle = "There is no data to display",
  redirectLink,
  redirectLabel,
}: EmptyStateProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 pb-16">
      <div className="relative">
        <Image
          src="/no-data.svg"
          width={200}
          height={200}
          alt="No messages"
          className="opacity-80"
        />
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-primary">{title}</h3>
        <p className="text-muted-foreground max-w-sm">{subtitle}</p>
      </div>

      {redirectLabel && redirectLink && pathname !== "/secret-page-2" && (
        <Button className="group" onClick={() => router.push(redirectLink)}>
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          {redirectLabel}
        </Button>
      )}
    </div>
  );
};
