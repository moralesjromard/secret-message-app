import { Bell, Lock } from "lucide-react";

import { UserButton } from "@/components/user-button";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";

export const Nav = () => {
  return (
    <div className="border-b w-full">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Lock className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold">Secret Message</h1>
          </Link>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  );
};
