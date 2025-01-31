"use client";

import { useEffect, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { updateSecretMessage } from "@/actions/secret-message";
import { useUserStore } from "@/store/user-store";
import { toast } from "sonner";

type SelectedMessage = {
  id: number;
  content: string;
};

interface updateSecretMessageModalProps {
  setIsOpen: (newValue: boolean) => void;
  isOpen: boolean;
  updateMessagesList: () => void;
  selectedMessage: SelectedMessage;
}

const formSchema = z.object({
  newMessage: z.string().min(3, {
    message: "Message must be at least 3 characters.",
  }),
});

export const UpdateSecretMessageModal = ({
  setIsOpen,
  isOpen,
  updateMessagesList,
  selectedMessage,
}: updateSecretMessageModalProps) => {
  const [isPending, startTransition] = useTransition();

  const { user } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newMessage: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      updateSecretMessage({
        secretMessageId: selectedMessage?.id,
        content: values.newMessage,
      }).then((res) => {
        if (res.error) {
          form.setError("newMessage", {
            type: "manual",
            message: res.message,
          });
        }
        if (res.error) {
          setIsOpen(false);
          return toast.error(res.message);
        }
        if (res.success) {
          setIsOpen(false);
          updateMessagesList();
          return toast.success(res.message);
        }
      });

      console.log(values);
    });
  };

  useEffect(() => {
    form.setValue("newMessage", selectedMessage.content);
  }, [isOpen]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Secret Message</DialogTitle>
          <DialogDescription>
            Modify your encrypted message while maintaining its security and
            privacy
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="updateSecretMessageForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="newMessage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[200px] p-4 rounded-lg border resize-none transition focus:outline-none"
                      placeholder="Write your new secret message here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <DialogFooter>
            <Button
              form="updateSecretMessageForm"
              type="submit"
              disabled={isPending}
            >
              Update
              {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
