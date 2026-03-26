import Link from 'next/link';
import { Card, CardContent, CardTitle, CardDescription } from './ui/card';
import { BookOpen, Video, MessageCircleQuestion, FileText, GraduationCap, Search } from 'lucide-react';
import HomePageClient from '@/app/HomePageClient';

const SECTIONS = [
  {
    title: 'סדרות שיעורים',
    description: 'סדרות וידאו מקיפות בפילוסופיה דתית — מבוא לפילוסופיה, מורה נבוכים, שמונה פרקים ועוד',
    href: '/playlists',
    icon: Video,
    cta: 'צפו בסדרות',
  },
  {
    title: 'מהבלוג',
    description: 'מאמרים מעמיקים בנושאי בחירה חופשית, השגחה, מהות האל, טעמי המצוות ועוד',
    href: '/blog',
    icon: BookOpen,
    cta: 'קראו מאמרים',
  },
  {
    title: 'שאלות ותשובות',
    description: 'שאלו שאלות וקבלו תשובות מפורטות בנושאי פילוסופיה דתית מהקהילה',
    href: '/responsa',
    icon: MessageCircleQuestion,
    cta: 'גלו שו״ת',
  },
  {
    title: 'כתבים',
    description: 'ספרים ומאמרים בפילוסופיה דתית — מורה נבוכים, כוזרי, שמונה פרקים ועוד',
    href: '/writings',
    icon: FileText,
    cta: 'עיינו בכתבים',
  },
];

export default function StitchHomeFallback() {
  return (
    <div className="w-full flex flex-col items-center gap-12">
      {/* Hero Section — Stitch gradient text */}
      <section className="w-full text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4">
          שלום צדיק
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-2">
          פילוסופיה דתית
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-4 px-4">
          פלטפורמה מקוונת ללימוד פילוסופיה דתית — שיעורי וידאו, מאמרים, ספרים, ושאלות ותשובות
          בנושאי הרמב״ם, כוזרי, אגדה, מוסר יהודי ועוד
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/playlists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <GraduationCap className="size-5" />
            התחילו ללמוד
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card text-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Search className="size-5" />
            חיפוש
          </Link>
        </div>
      </section>

      {/* Content Sections — 2x2 Grid */}
      <section className="w-full max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-200 group-hover:-translate-y-1 border border-border/50">
                  <CardContent className="p-0 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {section.description}
                    </CardDescription>
                    <span className="text-primary font-medium text-sm mt-2 group-hover:underline">
                      {section.cta} ←
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Subscribe + Donate (reuse existing components) */}
      <HomePageClient />
    </div>
  );
}
