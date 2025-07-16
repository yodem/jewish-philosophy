import React from 'react';
import { HeroSectionProps } from '../../types';
import { StrapiImage } from '../StrapiImage';
import Button from '../Button';

export default function HeroSection({ data }: { data: HeroSectionProps }) {
  const { theme, heading, image, cta, author } = data;
  return (
    <section className={`relative text-white py-8 px-2 sm:py-12 sm:px-4 md:py-20 md:px-8 rounded-xl overflow-hidden transition-all duration-500 ease-in-out hover:shadow-2xl`}>
      {image && (
        <div className={`absolute inset-0`}>
          <StrapiImage
            src={image.url}
            alt={image.alternativeText}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      )}
      <div className="relative z-10 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight">{heading}</h1>
        {author && <p className="text-base sm:text-lg md:text-xl opacity-90">By {author}</p>}
        {cta && (
          <Button
            href={cta.href}
            className={`inline-block px-4 py-2 sm:px-6 sm:py-3 bg-white text-${theme}-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300`}
          >
            {cta.text}
          </Button>
        )}
      </div>
    </section>
  );
} 