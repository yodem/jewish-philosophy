import ErrorBoundary from '@/components/ErrorBoundary';
import HomePageContent from '@/components/HomePageContent';
import { Suspense } from 'react';


function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  );
}

export default function HomeRoute() {
  return (
    <div className=' px-8 py-2'>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <HomePageContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
