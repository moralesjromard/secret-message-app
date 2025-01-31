import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SecretMessagesClient } from "@/components/secret-messages-client";
import { EmptyState } from "@/components/empty-state";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getSecretMessagesByUser } from "@/actions/secret-message";
import { createClient } from "@/utils/supabase/server";
import { checkFriendshipStatus } from "@/actions/friendship";
import { Forbidden } from "@/components/forbidden";

const SecretMessagesPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const userId = (await params).userId;

  const hasAccess = await checkFriendshipStatus({
    userId: data?.user?.id,
    targetUserId: userId,
  });

  const result = await getSecretMessagesByUser({
    userId: userId,
  });

  // Handle error case
  if ("error" in result) {
    return (
      <div className="border flex justify-center items-center min-h-[400px] rounded-xl">
        <EmptyState
          title="Error Loading Messages"
          subtitle={result.message}
          redirectLink="/"
          redirectLabel="Go back home"
        />
      </div>
    );
  }

  if (!hasAccess) {
    return <Forbidden />;
  }

  return (
    <>
      <header className="flex flex-col mb-6 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">
            {data?.user?.id === userId
              ? "Your "
              : `${result[0].user.name.split(" ")[0]} 's `}
            Secret Messages
          </h2>
          <p className="text-muted-foreground">
            {data?.user?.id === userId
              ? "Here are your secret messages."
              : `${
                  result[0].user.name.split(" ")[0]
                } has shared some secret messages with you.`}
          </p>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {result[0].user.name.split(" ")[0]}'s secret messages
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <SecretMessagesClient
        initialMessages={result}
        userId={userId}
        state="withoutFriends"
      />
    </>
  );
};

export default SecretMessagesPage;
