import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";

const homePageQuery = qs.stringify({
  populate: {
    blocks: {
      populate: '*'
    }
  }
});

export async function getHomePage() {
  const path = "/api/home-page";
  const url = new URL(path, BASE_URL);
  url.search = homePageQuery;

  return await fetchAPI(url.href, { method: "GET" });
}

const pageBySlugQuery = (slug: string) =>
  qs.stringify({
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: {
      blocks: {
        populate: '*'
      },
    },
  });

export async function getPageBySlug(slug: string) {
  const path = "/api/pages";
  const url = new URL(path, BASE_URL);
  url.search = pageBySlugQuery(slug);
  return await fetchAPI(url.href, { method: "GET" });
}

const globalSettingQuery = qs.stringify({
  populate: {
    header: {
      populate: {
        logo: {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
        navigation: true,
        cta: true,
      },
    },
    footer: {
      populate: {
        links: true,
      },
    },
  },
});

export async function getGlobalSettings() {
  const path = "/api/global";
  const url = new URL(path, BASE_URL);
  url.search = globalSettingQuery;
  return fetchAPI(url.href, { method: "GET" });
}

const allPlaylistsQuery = qs.stringify({
  populate: '*',
});

export async function getAllPlaylists() {
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = allPlaylistsQuery;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data
}

export async function getPlaylistBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: { videos: { populate: '*' } },
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  const item = res.data?.[0]
  return item
}

export async function getVideoBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: '*',
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  const item = res.data[0]
  return item
}
