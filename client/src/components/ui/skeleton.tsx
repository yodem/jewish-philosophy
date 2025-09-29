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

// Card skeleton for media items (blogs, playlists, videos) - matches MediaCard structure
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col w-full h-auto items-center transition-shadow duration-200 overflow-hidden bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md", className)}>
      {/* Image container: matches MediaCard's aspect-[4/3] */}
      <div className="w-full overflow-hidden rounded-t-lg relative aspect-[4/3]">
        <Skeleton className="w-full h-full bg-gray-200 dark:bg-gray-700" />
      </div>
      
      {/* Content container: matches MediaCard's padding and structure */}
      <div className="flex flex-col items-center p-4 w-full space-y-3">
        {/* Title */}
        <div className="w-full space-y-1">
          <Skeleton className="h-5 w-4/5 bg-gray-200 dark:bg-gray-700 mx-auto" />
          <Skeleton className="h-5 w-3/5 bg-gray-200 dark:bg-gray-700 mx-auto" />
        </div>
        
        {/* Episode count (optional) */}
        <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700 mx-auto" />
        
        {/* Description */}
        <div className="w-full space-y-1">
          <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 mx-auto" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md mt-4" />
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

// Grid skeleton for multiple cards - matches PaginatedGrid layout exactly
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
    <div className={cn("w-full max-w-full", className)}>
      {/* Mobile: Single column, Desktop: 3 columns grid - matches PaginatedGrid exactly */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="w-full">
            <CardSkeleton className={cn("w-full h-full flex flex-col justify-center", cardClassName)} />
          </div>
        ))}
      </div>
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
