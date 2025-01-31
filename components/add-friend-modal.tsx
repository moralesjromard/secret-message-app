"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

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

import { addFriendWithEmail } from "@/actions/friendship";
import { useUserStore } from "@/store/user-store";

interface AddFriendModalProps {
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  updateFriendship: () => void;
}

const formSchema = z.object({
  email: z.string().email(),
});

export const AddFriendModal = ({
  setIsOpen,
  isOpen,
  updateFriendship,
}: AddFriendModalProps) => {
  const [isPending, startTransition] = useTransition();

  const { user } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      addFriendWithEmail({ userId: user?.id!, email: values.email }).then(
        (res) => {
          if (res.emailError) {
            form.setError("email", {
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
            updateFriendship();
            return toast.success(res.message);
          }
        }
      );
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add friend</DialogTitle>
          <DialogDescription>
            Add a friend to your trusted circle.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="addFriendForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="h-[45px] transition"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <DialogFooter>
            <Button form="addFriendForm" type="submit" disabled={isPending}>
              Add friend
              {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
