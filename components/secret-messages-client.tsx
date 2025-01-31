"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { UpdateSecretMessageModal } from "@/components/update-secret-message-modal";
import { Button } from "@/components/ui/button";

import { getNameInitials } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import {
  getSecretMessagesByUser,
  getSecretMessagesByUserAndFriends,
  SecretMessage,
} from "@/actions/secret-message";
import { MessageSkeleton } from "./message-skeleton";
import { toast } from "sonner";

interface SecretMessagesClientProps {
  initialMessages: SecretMessage[];
  userId: string;
  state?: "withFriends" | "withoutFriends";
}

export function SecretMessagesClient({
  initialMessages,
  userId,
  state = "withFriends",
}: SecretMessagesClientProps) {
  const { user } = useUserStore();
  const [messages, setMessages] = useState<SecretMessage[]>(initialMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState({
    id: 0,
    content: "",
  });

  const handleOpenModal = (secretMessageId: number, content: string) => {
    setSelectedMessage({ id: secretMessageId, content });
    setIsOpen(true);
  };

  const handleGetSecretMessages = async () => {
    if (!user?.id) return;

    const res =
      state === "withFriends"
        ? await getSecretMessagesByUserAndFriends({ userId })
        : await getSecretMessagesByUser({ userId });

    if ("error" in res) {
      // Handle error case
      toast.error(res.message);
      return;
    }

    setMessages(res);
  };

  useEffect(() => {
    if (!userId) return;
    setIsLoading(false);
    setMessages(initialMessages);
  }, [initialMessages]);

  if (isLoading) {
    return <MessageSkeleton />;
  }

  return (
    <>
      <div className="grid gap-4">
        {messages.map((message) => (
          <div key={message.id}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-opacity-50 hover:border-opacity-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {message.user.name &&
                          getNameInitials(message.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {user?.id === message.user.user_id
                          ? `${message.user.name} (You)`
                          : message.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.user.email}
                      </p>
                    </div>
                  </div>
                  {user?.id === message.user.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        handleOpenModal(Number(message.id), message.content)
                      }
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/20 to-emerald-500/0 rounded-full" />
                  <p className="text-base leading-relaxed mb-3 pl-2">
                    {message.content}
                  </p>
                  <div className="flex justify-end items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t">
                    <time>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex justify-center items-center border rounded-xl">
            <EmptyState
              title="No Secret Messages Yet"
              subtitle="Create your first encrypted message to share sensitive information securely with others."
              redirectLink="/secret-page-2"
              redirectLabel="Create message"
            />
          </div>
        )}
      </div>

      <UpdateSecretMessageModal
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        updateMessagesList={handleGetSecretMessages}
        selectedMessage={selectedMessage}
      />
    </>
  );
}
