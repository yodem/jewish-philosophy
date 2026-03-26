import Link from "next/link";
import { LimitedCategoryList } from "@/components/shared/LimitedCategoryList";
import { Responsa } from "@/types";
import { MessageCircle, Eye } from "lucide-react";

interface ResponsaCardProps {
  responsa: Responsa;
  className?: string;
}

export default function ResponsaCard({ responsa, className }: ResponsaCardProps) {
  return (
    <Link
      href={`/responsa/${responsa.slug}`}
      className={`block bg-card rounded-lg border border-border p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 ${className || ""}`}
    >
      <h3 className="text-lg font-semibold text-foreground line-clamp-2">
        {responsa.title}
      </h3>

      {responsa.categories && responsa.categories.length > 0 && (
        <div className="mt-2">
          <LimitedCategoryList categories={responsa.categories} isSelectable={false} />
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3.5" />
          {responsa.comments?.length || 0}
        </span>
        {responsa.views != null && (
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" />
            {(responsa.views || 0).toLocaleString('he-IL')}
          </span>
        )}
        {responsa.publishedAt && (
          <span>{new Date(responsa.publishedAt).toLocaleDateString('he-IL')}</span>
        )}
      </div>
    </Link>
  );
}
