"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, ScrollText, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

const HomePage = () => {
  const router = useRouter();

  return (
    <>
      <header className="space-y-4 flex items-start flex-col justify-start">
        <h2 className="text-2xl font-bold text-primary">
          Welcome to Secret Message
        </h2>
        <p className="text-muted-foreground max-w-xl">
          Your private sanctuary for sharing secrets with trusted friends.
          Enhanced security, complete privacy.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TODO: Add card component */}
        <Card className="hover:shadow-lg transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Secret messages</CardTitle>
              <ScrollText className="size-7 text-primary" />
            </div>
            <CardDescription>
              Access secret messages in a secure environment
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/secret-page-1")}
            >
              View Messages
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Create message</CardTitle>
              <MessageCircle className="size-7 text-primary" />
            </div>
            <CardDescription>Write your encrypted message</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/secret-page-2")}
            >
              Create Message
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Trusted circle</CardTitle>
              <Users className="size-7 text-primary" />
            </div>
            <CardDescription>Manage your private network</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/secret-page-3")}
            >
              Manage Friends
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
export default HomePage;
