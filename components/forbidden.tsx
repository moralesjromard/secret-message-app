"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

export const Forbidden = () => {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center p-6 flex-col space-y-20">
      <div className="flex justify-center items-center flex-col">
        <h1 className="text-2xl font-bold">Permission denied</h1>
        <p className="text-muted-foreground text-lg">
          You do not have permission to access this page.
        </p>
      </div>
      <Image
        src="/forbidden-illustration.svg"
        width={400}
        height={400}
        alt="Permission denied illustration"
      />
    </div>
  );
};
