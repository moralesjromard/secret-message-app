"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Lock, Pencil, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useUserStore } from "@/store/user-store";
import { getSecretMessagesByUserAndFriends } from "@/actions/secret-message";
import { SecretMessagesClient } from "@/components/secret-messages-client";

export type Profile = {
  user_id: string;
  name: string;
  email: string;
};

export type SecretMessage = {
  id: string;
  content: string;
  created_at: string;
  user: Profile;
};

const SecretPage1 = () => {
  const { user } = useUserStore();

  const [messages, setMessages] = useState<SecretMessage[]>([]);

  const handleGetSecretMessages = async () => {
    if (!user?.id) return;

    const res = await getSecretMessagesByUserAndFriends({ userId: user.id });

    if ("error" in res) {
      // Handle error case
      toast.error(res.message);
      return;
    }

    setMessages(res);
  };

  useEffect(() => {
    handleGetSecretMessages();
  }, [user]);

  return (
    <>
      <header className="flex flex-col mb-6 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Secret messages</h2>
          <p className="text-muted-foreground">
            Access secret messages in a secure environment
          </p>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Secret messages</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <SecretMessagesClient
        initialMessages={messages}
        userId={user?.id!}
        state="withFriends"
      />
    </>
  );
};
export default SecretPage1;
