"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AddFriendModal } from "@/components/add-friend-modal";

import {
  getFriendshipsByUser,
  updateFriendshipStatus,
} from "@/actions/friendship";
import { useUserStore } from "@/store/user-store";
import { getNameInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";

type Friend = {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  addressee_id: string;
  name?: string;
  avatar?: string;
  addressee: {
    name: string;
    email: string;
    user_id: string;
  };
  requester: {
    name: string;
    email: string;
    user_id: string;
  };
};

const SecretPage3 = () => {
  const { user } = useUserStore();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<number>(0);

  // Confirmation modal state
  const [isApproveConfirmationOpen, setIsApproveConfirmationOpen] =
    useState(false);
  const [isRejectConfirmationOpen, setIsRejectConfirmationOpen] =
    useState(false);

  const handleGetFriendships = async () => {
    if (!user?.id) return;
    await getFriendshipsByUser({ userId: user.id }).then((res: any) => {
      const filterFriends = res.map((friend: Friend) => ({
        ...friend,
        name:
          user.id === friend.requester_id
            ? friend.addressee.name
            : friend.requester.name,
        avatar: getNameInitials(
          user.id === friend.requester_id
            ? friend.addressee.name
            : friend.requester.name
        ),
      }));
      setFriends(filterFriends);
    });
  };

  const handleUpdateFriendshipStatus = async ({
    friendshipId,
    status,
  }: {
    friendshipId: number;
    status: string;
  }) => {
    updateFriendshipStatus({ friendshipId, status })
      .then((res) => {
        if (res.error) {
          toast.error(res.message);
        }
        if (res.success && status === "approved") {
          toast.success(res.message);
          handleGetFriendships();
        }

        if (res.success && status === "rejected") {
          toast.success(res.message);
          handleGetFriendships();
        }
      })
      .catch((error) => {
        toast.error("Failed to update friendship status!");
      });
  };

  const handleOpenUpdateConfirmationModal = (
    friendId: number,
    status: string
  ) => {
    setSelectedFriendId(friendId);

    switch (status) {
      case "approved":
        setIsApproveConfirmationOpen(true);
        break;

      case "rejected":
        setIsRejectConfirmationOpen(true);
        break;
    }
  };

  useEffect(() => {
    handleGetFriendships();
  }, [user]);

  return (
    <>
      <header className="flex flex-col mb-6 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-primary">Trusted Circle</h2>
          <p className="text-muted-foreground">Manage your private network</p>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Trusted circle</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-primary">Friend List</CardTitle>
              <CardDescription className="text-muted-foreground">
                People you trust with your secrets
              </CardDescription>
            </div>
            <Button className="group" onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Add Friend
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend.id}>
                  <div className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {friend.addressee_id === user?.id &&
                          friend.status === "pending"
                            ? "Awaiting response"
                            : friend.requester_id === user?.id &&
                              friend.status === "pending"
                            ? "Waiting for approval"
                            : "Trusted friend"}
                        </p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      {friend.addressee_id === user?.id &&
                        friend.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="hover:shadow-md transition-shadow"
                              onClick={() =>
                                handleOpenUpdateConfirmationModal(
                                  friend.id,
                                  "approved"
                                )
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="hover:shadow-md transition-shadow"
                              onClick={() =>
                                handleOpenUpdateConfirmationModal(
                                  friend.id,
                                  "rejected"
                                )
                              }
                            >
                              Decline
                            </Button>
                          </>
                        )}

                      {friend.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:shadow-md transition-shadow"
                          onClick={() => {
                            router.push(
                              `/messages/${
                                user?.id === friend.addressee_id
                                  ? friend.requester_id
                                  : friend.addressee_id
                              }`
                            );
                          }}
                        >
                          View Messages
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No friends added yet"
                subtitle="Click 'Add Friend' to get started!"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <AddFriendModal
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        updateFriendship={handleGetFriendships}
      />
      <ConfirmationDialog
        isOpen={isApproveConfirmationOpen}
        onClose={() => setIsApproveConfirmationOpen(false)}
        onConfirm={() =>
          handleUpdateFriendshipStatus({
            friendshipId: selectedFriendId,
            status: "approved",
          })
        }
        title="Accept friend request"
        description="If you accept this friend request, you will be able to share secrets with this person."
        cancelText="Cancel"
        confirmText="Accept"
        variant="default"
      />

      <ConfirmationDialog
        isOpen={isRejectConfirmationOpen}
        onClose={() => setIsRejectConfirmationOpen(false)}
        onConfirm={() =>
          handleUpdateFriendshipStatus({
            friendshipId: selectedFriendId,
            status: "rejected",
          })
        }
        title="Decline friend request"
        description="If you decline this friend request, you will not be able to share secrets with this person."
        cancelText="Cancel"
        confirmText="Decline"
        variant="destructive"
      />
    </>
  );
};

export default SecretPage3;
