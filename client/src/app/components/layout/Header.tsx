"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StrapiImage } from "../StrapiImage";
import { LinkProps, LogoProps } from "@/types";

interface HeaderProps {
    data: {
        logo: LogoProps;
        navigation: LinkProps[];
        cta: LinkProps;
    };
}

export function Header({ data }: HeaderProps) {
    const pathname = usePathname();
    const headerLight = pathname === "/series";

    if (!data) return null;

    const { logo, navigation, cta } = data;
    return (
        <header className={`flex items-center justify-between p-4 ${headerLight ? "bg-white" : "bg-gray-100"}`}>
            <Link href="/">
                <StrapiImage
                    src={logo.image.url}
                    alt={logo.image.alternativeText || "No alternative text provided"}
                    className={`w-30 h-30 ${headerLight ? "filter invert" : ""}`}
                    width={120}
                    height={120}
                />
            </Link>
            <ul className="flex space-x-6">
                {navigation.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={item.href}
                            target={item.isExternal ? "_blank" : "_self"}
                        >
                            <h5 className="text-lg font-medium hover:text-gray-600">{item.text}</h5>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href={cta.href} target={cta.isExternal ? "_blank" : "_self"}>
                <button className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">{cta.text}</button>
            </Link>
        </header>
    );
}