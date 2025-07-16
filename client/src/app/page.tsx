import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getHomePage } from "@/data/loaders";
import { Suspense } from "react";

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse rounded-full bg-blue-500 p-4 text-white">
        Loading...
      </div>
    </div>
  );
}

export default async function HomeRoute() {
  const homeRes = await getHomePage();  
  const blocks = homeRes?.data?.blocks || [];
  return (
    <main className="mx-auto px-4 py-8">
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <BlockRenderer blocks={blocks} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
