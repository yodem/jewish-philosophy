import { cn } from '@/lib/utils';

interface ContentGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export default function ContentGrid({
  children,
  className,
  columns = 3,
}: ContentGridProps) {
  const columnClasses: Record<number, string> = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8',
    3: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8',
  };

  return (
    <div className={cn("w-full max-w-full", className)}>
      <div className={columnClasses[columns]}>
        {children}
      </div>
    </div>
  );
}
