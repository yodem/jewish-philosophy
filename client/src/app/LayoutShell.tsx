import Navbar from '@/components/layout/Navbar';
import Banner from '@/components/layout/Banner';
import { getGlobalSettings, getBanner } from "@/data/loaders";
import type { Banner as BannerType } from "@/types";

export default async function LayoutShell({ children }: { children: React.ReactNode }) {
  const [globalRes, bannerRes] = await Promise.all([
    getGlobalSettings(),
    getBanner(),
  ]);

  const header = globalRes?.data?.header;
  const banner: BannerType | null = bannerRes?.data;

  return (
    <>
      <Navbar header={header} />
      {banner && banner.isActive && (
        <Banner banner={banner} />
      )}
      <main className="flex-1 flex flex-col w-full pb-12 overflow-x-hidden">
        {children}
      </main>
    </>
  );
}
