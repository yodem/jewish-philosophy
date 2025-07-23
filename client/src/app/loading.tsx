import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full space-y-6 p-4">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2 bg-blue-200" />
                <Skeleton className="h-4 w-3/4 bg-blue-200" />
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-40 w-full bg-blue-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full bg-blue-200 rounded-lg" />
                    <Skeleton className="h-48 w-full bg-blue-200 rounded-lg" />
                    <Skeleton className="h-48 w-full bg-blue-200 rounded-lg" />
                </div>
            </div>
            
            {/* Loading indicator */}
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </div>
    );
}
