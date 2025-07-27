import React from 'react';
import { InfoBlockProps } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '../ui/card';
import { StrapiImage } from '../StrapiImage';
import ReactMarkdown from 'react-markdown';

export default function InfoBlock({ data }: { data: InfoBlockProps }) {
  const { heading, content, image, cta, reversed } = data;
  return (
    <Card className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-10 p-4 md:p-8 items-center rounded-2xl shadow-lg border-0 bg-white/90 max-w-4xl mx-auto my-6`}>
      {image && (
        <div className="flex-shrink-0 w-full md:w-[400px] h-[250px] md:h-[300px] mb-4 md:mb-0">
          <StrapiImage 
            src={image.url} 
            alt={image.alternativeText} 
            width={400} 
            height={300} 
            aspectRatio="landscape"
            className="w-full h-full rounded-lg shadow-md" 
          />
        </div>
      )}
      <CardContent className="flex-1 flex flex-col justify-center items-start gap-2 md:gap-4 px-0">
        <CardTitle className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-gray-900">{heading}</CardTitle>
        <CardDescription className="text-gray-700 mb-2 md:mb-4 text-base md:text-lg text-justify">
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardDescription>
        {cta && (
          <Button asChild className="mt-2 md:mt-4">
            <a href={cta.href}>{cta.text}</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 