import React from 'react';
import { InfoBlockProps } from '../../types';
import Button from '../Button';
import { StrapiImage } from '../StrapiImage';

export default function InfoBlock({ data }: { data: InfoBlockProps }) {
  const { heading, content, image, cta } = data;
  return (
    <section className={`flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8 justify-between rounded-xl shadow-md`}>
      {image && (
        <div className="w-full md:w-auto flex-shrink-0 mb-4 md:mb-0">
          <StrapiImage src={image.url} alt={image.alternativeText} width={300} height={200} className="rounded-lg object-cover w-full md:w-[400px] h-auto md:h-[300px]" />
        </div>
      )}
      <div className="space-y-2 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">{heading}</h2>
        <p className="text-gray-700">{content}</p>
        {cta && (
          <Button href={cta.href} className="mt-2 md:mt-4">
            {cta.text}
          </Button>
        )}
      </div>
    </section>
  );
} 