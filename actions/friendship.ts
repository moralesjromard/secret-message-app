"use server";

import { createClient } from "@/utils/supabase/server";

export const addFriendWithEmail = async ({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) => {
  const supabase = await createClient();

  // Check if the email is already in the database
  const { data: addressee, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    return {
      emailError: true,
      message: "Email does not exist!",
    };
  }

  // Prevent self-friendship
  if (addressee.user_id === userId) {
    return {
      emailError: true,
      message: "You cannot add yourself as a friend!",
    };
  }

  // Check if the user is already friends with the addressee (in any direction) and the status is either "approved" or "pending"
  const { data: existingFriendship } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .or(
      `requester_id.eq.${addressee.user_id},addressee_id.eq.${addressee.user_id}`
    )
    .in("status", ["approved", "pending", "rejected"])
    .single();

  if (existingFriendship) {
    if (existingFriendship.status === "approved") {
      return {
        emailError: true,
        message: "You are already friends with this person!",
      };
    }

    if (
      existingFriendship.status === "pending" &&
      existingFriendship.requester_id === userId
    ) {
      return {
        emailError: true,
        message: "You have already sent a friend request to this person!",
      };
    }

    if (
      existingFriendship.status === "pending" &&
      existingFriendship.addressee_id === userId
    ) {
      return {
        emailError: true,
        message: "This person has already sent a friend request to you!",
      };
    }

    if (existingFriendship.status === "rejected") {
      // Delete the existing friendship first
      const { error: deleteFriendshipError } = await supabase
        .from("friendships")
        .delete()
        .match({ id: existingFriendship.id });

      if (deleteFriendshipError) {
        return {
          error: true,
          message: "Failed to delete existing friendship!",
        };
      }

      // Create a new friendship
      const { error: addFriendError } = await supabase
        .from("friendships")
        .insert({
          requester_id: userId,
          addressee_id: addressee.user_id,
        });

      if (addFriendError) {
        return {
          error: true,
          message: "Failed to add friend!!",
          serverErrorMessage: addFriendError.message,
        };
      }

      return {
        success: true,
        message: "Friend request sent successfully!",
      };
    }
  }

  const { error: addFriendError } = await supabase.from("friendships").insert({
    requester_id: userId,
    addressee_id: addressee.user_id,
  });

  if (addFriendError) {
    return {
      error: true,
      message: "Failed to add friend!",
      serverErrorMessage: addFriendError.message,
    };
  }

  return {
    success: true,
    message: "Friend request sent successfully!",
  };
};

export const getFriendshipsByUser = async ({ userId }: { userId: string }) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      requester:profiles!requester_id(
        user_id,
        name,
        email
      ),
      addressee:profiles!addressee_id(
        user_id,
        name,
        email
      )
    `
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .neq("status", "rejected");

  if (error) {
    return {
      error: true,
      message: "Failed to fetch friendships!",
      serverErrorMessage: error.message,
    };
  }

  return data;
};

export const updateFriendshipStatus = async ({
  friendshipId,
  status,
}: {
  friendshipId: number;
  status: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("friendships")
    .update({
      status,
    })
    .match({ id: friendshipId });

  if (error) {
    return {
      error: true,
      message: "Failed to update friendship status!",
      serverErrorMessage: error.message,
    };
  }

  if (status === "approved") {
    return {
      success: true,
      message: "You are now friends with this person!",
    };
  }

  if (status === "rejected") {
    return {
      success: true,
      message: "You rejected the friend request!",
    };
  }

  return {
    success: true,
  };
};

export const checkFriendshipStatus = async ({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}) => {
  const supabase = await createClient();

  if (userId === targetUserId) {
    return true;
  }

  const { data, error } = await supabase
    .from("friendships")
    .select("id") // Select only the `id` for performance
    .or(
      `requester_id.eq.${userId},addressee_id.eq.${targetUserId},requester_id.eq.${targetUserId},addressee_id.eq.${userId}`
    )
    .eq("status", "approved")
    .limit(1); // Only need to check if at least one row exists

  if (error) {
    return false; // Assume not friends if an error occurs
  }

  return data?.length > 0; // If there is at least one row, return true
};
