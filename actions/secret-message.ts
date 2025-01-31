"use server";

import { createClient } from "@/utils/supabase/server";

export type FriendshipWithProfiles = {
  requester_id: string;
  addressee_id: string;
  requester: {
    user_id: string;
    name: string;
    email: string;
  };
  addressee: {
    user_id: string;
    name: string;
    email: string;
  };
};

export interface Profile {
  user_id: string;
  name: string;
  email: string;
}

export interface SecretMessage {
  id: string;
  content: string;
  created_at: string;
  user: Profile;
}

export interface ApiError {
  error: true;
  message: string;
}

export const getSecretMessagesByUser = async ({
  userId,
}: {
  userId: string;
}): Promise<SecretMessage[] | ApiError> => {
  const supabase = await createClient();

  // First get messages
  const { data: messages, error: messagesError } = await supabase
    .from("secret_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (messagesError) {
    return {
      error: true,
      message: "Failed to fetch secret messages!",
    };
  }

  // Then get the profile for the user
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, name, email")
    .eq("user_id", userId);

  if (profilesError) {
    return {
      error: true,
      message: "Failed to fetch user profile!",
    };
  }

  // Combine messages with user information
  const messagesWithUser = messages.map((message) => ({
    id: message.id,
    content: message.content,
    created_at: message.created_at,
    user: profiles[0], // Since we're only getting one user's profile
  }));

  return messagesWithUser;
};

export const getSecretMessagesByUserAndFriends = async ({
  userId,
}: {
  userId: string;
}) => {
  const supabase = await createClient();

  // First, get all approved friendships and friend profiles
  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select(
      `
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey (
        user_id,
        name,
        email
      ),
      addressee:profiles!friendships_addressee_id_fkey (
        user_id,
        name,
        email
      )
    `
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "approved");

  if (friendshipsError) {
    return {
      error: true,
      message: "Failed to fetch friendships!",
    };
  }

  // Process friendships to get friend info
  const friends = friendships.map((friendship: any) => {
    if (friendship.requester_id === userId) {
      return {
        id: friendship.addressee.user_id,
        name: friendship.addressee.name,
        email: friendship.addressee.email,
      };
    } else {
      return {
        id: friendship.requester.user_id,
        name: friendship.requester.name,
        email: friendship.requester.email,
      };
    }
  });

  // Get the friend IDs
  const friendIds = friends.map((friend) => friend.id);

  // First get messages
  const { data: messages, error: messagesError } = await supabase
    .from("secret_messages")
    .select("*")
    .in("user_id", [userId, ...friendIds])
    .order("created_at", { ascending: false });

  if (messagesError) {
    return {
      error: true,
      message: "Failed to fetch secret messages!",
    };
  }

  // Then get the profiles for the message authors
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, name, email")
    .in(
      "user_id",
      messages.map((msg) => msg.user_id)
    );

  if (profilesError) {
    return {
      error: true,
      message: "Failed to fetch user profiles!",
    };
  }

  // Create a map of user_id to profile for easy lookup
  const profileMap = profiles.reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {} as Record<string, (typeof profiles)[0]>);

  // Combine messages with user information
  const messagesWithUsers = messages.map((message) => ({
    id: message.id,
    content: message.content,
    created_at: message.created_at,
    user: profileMap[message.user_id],
  }));

  return messagesWithUsers;
};

export const createSecretMessage = async ({
  content,
  userId,
}: {
  content: string;
  userId: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase.from("secret_messages").insert({
    content,
    user_id: userId,
  });

  if (error) {
    return {
      error: true,
      message: "Failed to create secret message!",
    };
  }

  return {
    success: true,
    message: "Secret message created successfully!",
  };
};

export const updateSecretMessage = async ({
  secretMessageId,
  content,
}: {
  secretMessageId: number;
  content: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("secret_messages")
    .update({ content })
    .match({ id: secretMessageId });

  if (error) {
    return {
      error: true,
      message: "Failed to update secret message!",
    };
  }

  return {
    success: true,
    message: "Secret message updated successfully!",
  };
};

export const deleteSecretMessage = async ({
  secretMessageId,
}: {
  secretMessageId: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("secret_messages")
    .delete()
    .match({ secretMessageId });

  if (error) {
    return {
      error: true,
      message: "Failed to delete secret message!",
    };
  }

  return {
    success: true,
    message: "Secret message deleted successfully!",
  };
};
