import Navbar from '@/components/layout/Navbar';
import Banner from '@/components/layout/Banner';
import Footer from '@/components/layout/Footer';
import { getGlobalSettings, getBanner } from "@/data/loaders";
import type { Banner as BannerType } from "@/types";

export default async function LayoutShell() {
  const [globalRes, bannerRes] = await Promise.all([
    getGlobalSettings(),
    getBanner(),
  ]);

  const header = globalRes?.data?.header;
  const footer = globalRes?.data?.footer;
  const banner: BannerType | null = bannerRes?.data;

  return (
    <>
      <Navbar header={header} />
      {banner && banner.isActive && (
        <Banner banner={banner} />
      )}
      <Footer copyright={footer?.copyright} links={footer?.links} />
    </>
  );
}
