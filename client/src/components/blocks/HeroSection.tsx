import React from 'react';
import { HeroSectionProps } from '../../types';
import { StrapiImage } from '../StrapiImage';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';

export default function HeroSection({ data }: { data: HeroSectionProps }) {
  const { heading, image, cta } = data;
  return (
    <Card className="relative overflow-hidden p-0 bg-gradient-to-br from-blue-500/80 via-cyan-500/60 to-white shadow-xl border-0 h-[250px] sm:h-[350px] md:h-[450px] flex flex-col flex-1 justify-center items-center w-full max-w-4xl mx-auto my-6 sm:my-10 md:my-16">
      {image && (
        <div className="absolute inset-0 z-0 w-full h-full">
          <StrapiImage
            src={image.url}
            alt={image.alternativeText}
            width={1200}
            height={800}
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105 opacity-60"
            fill
          />
        </div>
      )}
      <CardContent className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-4 sm:py-16 sm:px-8 gap-4 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg mb-2">{heading}</h1>
        {cta && (
          <Button
            asChild
            className="mt-4 px-6 py-3 text-lg font-semibold rounded-lg shadow-md bg-white text-cyan-700 hover:bg-gray-100 transition-colors duration-300"
          >
            {cta.isExternal ? (
              <a href={cta.href} target="_blank" rel="noopener noreferrer">{cta.text}</a>
            ) : (
              <Link href={cta.href}>{cta.text}</Link>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 