import { StrapiImage } from "../StrapiImage";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import type { InfoBlockProps } from "@/types";

export function InfoBlock({
    theme,
    reversed,
    image,
    heading,
    content,
    cta,
}: Readonly<InfoBlockProps>) {
    console.log({ theme, reversed, image, heading, content, cta });

    const themeClasses = {
        turquoise: 'bg-teal-50',
        orange: 'bg-orange-50',
        blue: 'bg-blue-50',
    };

    const headlineThemeClasses = {
        turquoise: 'text-teal-900',
        orange: 'text-orange-900',
        blue: 'text-blue-900',
    };

    const buttonThemeClasses = {
        turquoise: 'bg-teal-600 hover:bg-teal-700',
        orange: 'bg-orange-600 hover:bg-orange-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
    };

    const getThemeClass = (theme: string) => {
        return themeClasses[theme as keyof typeof themeClasses] || themeClasses.blue;
    };

    const getHeadlineThemeClass = (theme: string) => {
        return headlineThemeClasses[theme as keyof typeof headlineThemeClasses] || headlineThemeClasses.blue;
    };

    const getButtonThemeClass = (theme: string) => {
        return buttonThemeClasses[theme as keyof typeof buttonThemeClasses] || buttonThemeClasses.blue;
    };

    return (
        <section className={`py-16 px-4 ${getThemeClass(theme)}`}>
            <div className="container mx-auto max-w-6xl">
                <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
                    <div className="flex-1 max-w-lg">
                        {image?.url && <StrapiImage
                            src={image.url}
                            alt={image.alternativeText || "No alternative text provided"}
                            height={500}
                            width={600}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />}
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-4xl font-bold mb-6 ${getHeadlineThemeClass(theme)}`}>
                            {heading}
                        </h2>
                        <ReactMarkdown>{content}</ReactMarkdown>
                        {cta && (
                            <Link href={cta.href} target={cta.isExternal ? "_blank" : "_self"}>
                                <button className={`${getButtonThemeClass(theme)} text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 hover:shadow-lg`}>
                                    {cta.text}
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
