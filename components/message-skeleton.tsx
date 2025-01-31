import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const MessageSkeleton = () => {
  return (
    <div>
      <Card className="border-opacity-50 shadow-sm border-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar skeleton */}
              <Skeleton className="w-10 h-10 rounded-full" />

              <div>
                {/* Name skeleton */}
                <Skeleton className="h-4 w-24 mb-2" />
                {/* Email skeleton */}
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Edit button skeleton */}
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative">
            {/* Green line decoration */}
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/20 to-emerald-500/0 rounded-full" />

            <div className="pl-2">
              {/* Message content skeleton - multiple lines */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[90%] mb-2" />
              <Skeleton className="h-4 w-[75%]" />

              {/* Timestamp skeleton */}
              <div className="flex justify-end items-center gap-2 mt-4 pt-4 border-t">
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
