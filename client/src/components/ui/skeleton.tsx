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
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} className={cardClassName} />
      ))}
    </div>
  )
}

// Terms card skeleton (text-only, no image)
function TermCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 space-y-4 h-full flex flex-col", className)}>
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-4/5 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Description */}
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Author */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Categories */}
      <div className="flex gap-1 flex-wrap justify-end">
        <Skeleton className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <Skeleton className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <Skeleton className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  )
}

// Terms grid skeleton with proper responsive layout
function TermsGridSkeleton({
  count = 12,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <TermCardSkeleton key={index} />
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

export { Skeleton, CardSkeleton, TableRowSkeleton, GridSkeleton, ContentSkeleton, TermCardSkeleton, TermsGridSkeleton }
