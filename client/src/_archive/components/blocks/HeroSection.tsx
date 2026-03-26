import React from 'react';
import { HeroSectionProps } from '../../types';
import { StrapiImage } from '../StrapiImage';

export default function HeroSection({ data }: { data: HeroSectionProps }) {
  const { heading, image } = data;
  return (
    <section className="relative p-8 md:p-16 text-center border-b border-border overflow-hidden">
      {image && (
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <StrapiImage
            src={image.url}
            alt={image.alternativeText}
            width={1200}
            height={800}
            className="object-cover w-full h-full"
            fill
          />
        </div>
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
          {heading}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          מרכז הידע וההגות להעמקה ביסודות המחשבה היהודית, מחקר פילוסופי וחיבור בין עולם המעשה לעולם הרוח.
        </p>
      </div>
    </section>
  );
}
