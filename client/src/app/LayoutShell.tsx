import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import { getGlobalSettings, getBanner } from "@/data/loaders";
import type { Banner as BannerType } from "@/types";

export default async function LayoutShell() {
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
    </>
  );
}
