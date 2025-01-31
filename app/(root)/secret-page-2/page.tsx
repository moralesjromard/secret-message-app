"use client";

import { LoaderCircle, Shield } from "lucide-react";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useUserStore } from "@/store/user-store";
import {
  createSecretMessage,
  getSecretMessagesByUser,
} from "@/actions/secret-message";
import { SecretMessagesClient } from "@/components/secret-messages-client";
import { SecretMessage } from "../secret-page-1/page";

const SecretPage2 = () => {
  const [isPending, startTransition] = useTransition();

  const [messages, setMessages] = useState<SecretMessage[]>([]);

  const { user } = useUserStore();

  const [secretMessage, setSecretMessage] = useState("");

  const handleGetSecretMessages = async () => {
    if (!user?.id) return;

    const res = await getSecretMessagesByUser({ userId: user.id });

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      createSecretMessage({
        content: secretMessage,
        userId: user?.id!,
      })
        .then((res) => {
          if (res.error) {
            return toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            setSecretMessage("");
            handleGetSecretMessages();
          }
        })
        .catch((err) => {
          toast.error(err.message);
        });
    });
  };

  return (
    <>
      <header className="flex flex-col mb-6 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Create message</h2>
          <p className="text-muted-foreground">Write your encrypted message</p>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create message</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>End-to-end encrypted message</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full min-h-[120px] p-4 rounded-lg border resize-none transition focus:outline-none"
            placeholder="Write your secret message here..."
            onChange={(e) => setSecretMessage(e.target.value)}
            value={secretMessage}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Only shared with selected friends
            </p>
            <Button
              type="button"
              className="group"
              onClick={onSubmit}
              disabled={isPending}
            >
              {!isPending && (
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              Save Message
              {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SecretMessagesClient
        initialMessages={messages}
        userId={user?.id!}
        state="withoutFriends"
      />
    </>
  );
};
export default SecretPage2;
