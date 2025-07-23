import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Card skeleton for media items (blogs, playlists, videos)
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full bg-white rounded-lg shadow-md p-4 space-y-4", className)}>
      <Skeleton className="w-full aspect-video bg-gray-200" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <Skeleton className="h-3 w-1/2 bg-gray-200" />
      </div>
    </div>
  )
}

// Table row skeleton
function TableRowSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-4">
          <Skeleton className="h-4 w-full bg-gray-200" />
        </td>
      ))}
    </tr>
  )
}

// Grid skeleton for multiple cards
function GridSkeleton({ 
  count = 6, 
  className,
  cardClassName 
}: { 
  count?: number;
  className?: string;
  cardClassName?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} className={cardClassName} />
      ))}
    </div>
  )
}

// Text content skeleton
function ContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-3/4 bg-gray-200" />
      <Skeleton className="h-4 w-full bg-gray-200" />
      <Skeleton className="h-4 w-5/6 bg-gray-200" />
      <Skeleton className="h-4 w-4/5 bg-gray-200" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-2/3 bg-gray-200" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableRowSkeleton, GridSkeleton, ContentSkeleton }
