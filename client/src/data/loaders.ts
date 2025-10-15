import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Blog, Writing, Term } from "@/types";


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

  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 14 } });
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
  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
}

const globalSettingQuery = qs.stringify({
  populate: {
    header: {
      populate: {
        logo: {
          populate: {
            image: true
          }
        },
        navigation: true,
        cta: true
      }
    },
    footer: {
      populate: '*'
    }
  }
});

export async function getGlobalSettings() {
  const path = "/api/global";
  const url = new URL(path, BASE_URL);
  url.search = globalSettingQuery;
  return fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
}

export async function getBanner() {
  const path = "/api/banner";
  const url = new URL(path, BASE_URL);
  return fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 5 } }); // Revalidate every 5 minutes for banner updates
}

const allPlaylistsQuery = qs.stringify({
  populate: {
    videos: {
      filters: {
        title: {
          $ne: 'Private video'
        }
      },
      populate: '*'
    }
  },
  pagination: {
    pageSize: 100
  }
});

export async function getAllPlaylists() {
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = allPlaylistsQuery;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data
}

export async function getPlaylistsPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    populate: {
      videos: {
        filters: {
          title: {
            $ne: 'Private video'
          }
        },
        populate: '*'
      }
    },
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getPlaylistBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: { 
      videos: { 
        filters: {
          title: {
            $ne: 'Private video'
          }
        },
        populate: '*' 
      } 
    },
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  if (res.data.length === 0) return null;
  
  const item = res.data?.[0]
  return item
}

export async function getPlaylistVideosPaginated(playlistId: number, page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      },
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
    pagination: {
      page,
      pageSize
    },
    sort: ['createdAt:asc'] // Maintain video order in playlist
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getAllPlaylistVideos(playlistId: number) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      },
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
    pagination: {
      pageSize: 100 // Get up to 100 videos in one call
    },
    sort: ['createdAt:asc'] // Maintain video order in playlist
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getVideoBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  if (res.data.length === 0) return null;
  const item = res.data[0]
  return item
}

export async function getVideosPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    filters: {
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

// Blog queries
const allBlogsQuery = qs.stringify({
  populate: '*',
  sort: ['publishedAt:desc'],
  pagination: {
    pageSize: 100
  }
});

export async function getAllBlogs(): Promise<Blog[]> {
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = allBlogsQuery;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data
}

export async function getBlogsPaginated(page: number = 1, pageSize: number = 12): Promise<Blog[]> {
  const query = qs.stringify({
    populate: '*',
    sort: ['publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getBlogBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: '*',
  });
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  if (res.data.length === 0) return null;
  
  return res.data[0]
}



// Responsa queries
const responsaPageQuery = qs.stringify({
  populate: {
    heroSection: {
      populate: '*'
    }
  }
});

export async function getResponsaPage() {
  const path = "/api/responsa-page";
  const url = new URL(path, BASE_URL);
  url.search = responsaPageQuery;
  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 3 } });
}

export async function getAllResponsas(page = 1, pageSize = 10, search = '') {
  const query = qs.stringify({
    populate: {
      categories: true,
      comments: {
        filters: {
          publishedAt: { $notNull: true }
        }
      }
    },
    sort: ['createdAt:desc'],
    pagination: {
      page,
      pageSize
    },
    ...(search ? {
      filters: {
        title: {
          $containsi: search
        }
      }
    } : {})
  });
  
  const path = "/api/responsas";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 } });
  
  return {
    data: res.data,
    meta: res.meta
  };
}

export async function getResponsaBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: {
      categories: true,
      writings: {
        populate: ['author', 'categories']
      },
      comments: {
        filters: {
          publishedAt: { $notNull: true }
        },
        sort: ['createdAt:asc'],
        populate: {
          writings: {
            populate: ['author', 'categories']
          },
          videos: {
            populate: ['playlist']
          },
          responsas: {
            populate: ['categories']
          },
          threads: {
            filters: {
              publishedAt: { $notNull: true }
            },
            sort: ['createdAt:asc'],
            populate: {
              writings: {
                populate: ['author', 'categories']
              },
              videos: {
                populate: ['playlist']
              },
              responsas: {
                populate: ['categories']
              }
            },
            fields: ['id', 'documentId', 'slug', 'answer', 'answerer', 'createdAt', 'updatedAt', 'publishedAt', 'parentCommentSlug', 'responsaSlug', 'blogSlug']
          }
        }
      }
    },
  });
  const path = "/api/responsas";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;

  return res.data[0];
}

export async function createComment(data: { answer: string; answerer: string; responsaSlug?: string; blogSlug?: string }) {
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  
  const result = await fetchAPI(url.href, { 
    method: "POST",
    body: { data }
  });
  
  return result;
}

export async function createThread(data: { answer: string; answerer: string; parentCommentSlug: string; responsaSlug?: string; blogSlug?: string }) {
  const path = "/api/threads";
  const url = new URL(path, BASE_URL);

  const result = await fetchAPI(url.href, {
    method: "POST",
    body: { data }
  });

  return result;
}

export async function getBlogCommentsBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      blogSlug: { $eq: slug },
      publishedAt: { $notNull: true }
    },
    sort: ['createdAt:asc'],
    populate: {
      writings: {
        populate: ['author', 'categories']
      },
      videos: {
        populate: ['playlist']
      },
      responsas: {
        populate: ['categories']
      },
      threads: {
        filters: {
          publishedAt: { $notNull: true }
        },
        sort: ['createdAt:asc'],
        populate: {
          writings: {
            populate: ['author', 'categories']
          },
          videos: {
            populate: ['playlist']
          },
          responsas: {
            populate: ['categories']
          }
        },
        fields: ['id', 'documentId', 'slug', 'answer', 'answerer', 'createdAt', 'updatedAt', 'publishedAt', 'parentCommentSlug', 'responsaSlug', 'blogSlug']
      }
    }
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 2 } });
  
  return res.data || [];
}

export async function getResponsaComments(responsaId: number) {
  const query = qs.stringify({
    filters: {
      responsa: { id: { $eq: responsaId } },
      publishedAt: { $notNull: true }
    },
    sort: ['createdAt:asc'],
    populate: {
      writings: {
        populate: ['author', 'categories']
      }
    }
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 2 } });
  
  return res.data || [];
}

export async function getResponsaCommentsBySlug(responsaSlug: string) {
  const query = qs.stringify({
    filters: {
      responsaSlug: { $eq: responsaSlug },
      publishedAt: { $notNull: true }
    },
    sort: ['createdAt:asc'],
    populate: {
      writings: {
        populate: ['author', 'categories']
      },
      videos: {
        populate: ['playlist']
      },
      responsas: {
        populate: ['categories']
      },
      threads: {
        filters: {
          publishedAt: { $notNull: true }
        },
        sort: ['createdAt:asc'],
        populate: {
          writings: {
            populate: ['author', 'categories']
          },
          videos: {
            populate: ['playlist']
          },
          responsas: {
            populate: ['categories']
          }
        },
        fields: ['id', 'documentId', 'slug', 'answer', 'answerer', 'createdAt', 'updatedAt', 'publishedAt', 'parentCommentSlug', 'responsaSlug', 'blogSlug']
      }
    }
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 2 } });
  
  return res.data || [];
}

// Writing queries
const allWritingsQuery = qs.stringify({
  populate: '*',
  sort: ['priority:asc', 'publishedAt:desc'],
  pagination: {
    pageSize: 100
  }
});

export async function getAllWritings(): Promise<Writing[]> {
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = allWritingsQuery;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  
  return res.data || [];
}

export async function getWritingsPaginated(
  page: number = 1, 
  pageSize: number = 12,
  typeFilter?: 'book' | 'article' | 'all',
  searchTerm?: string
): Promise<{ data: Writing[]; meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } } }> {
  const query = qs.stringify({
    populate: '*',
    sort: [
      'priority:asc', // Lower numbers = higher priority (1 is most prioritized)
      'type:desc', // 'book' comes before 'article' alphabetically when sorted descending
      'publishedAt:desc'
    ],
    pagination: {
      page,
      pageSize
    },
    filters: {
      ...(typeFilter && typeFilter !== 'all' ? { type: { $eq: typeFilter } } : {}),
      ...(searchTerm ? {
        $or: [
          { title: { $containsi: searchTerm } },
          { description: { $containsi: searchTerm } }
        ]
      } : {})
    }
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  
  // Now Strapi handles the sorting at the database level: books first, then articles
  return {
    data: res.data || [],
    meta: res.meta || { pagination: { page, pageSize, total: 0, pageCount: 0 } }
  };
}

export async function getWritingsByType(type: 'book' | 'article', page: number = 1, pageSize: number = 12): Promise<Writing[]> {
  const query = qs.stringify({
    filters: {
      type: {
        $eq: type
      }
    },
    populate: '*',
    sort: ['priority:asc', 'publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  
  return res.data || [];
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: {
      author: true,
      categories: true,
      blogs: true,
      responsas: true,
      image: true,
      pdfFile: true,
      linkToWriting: true,
    },
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  if (res.data.length === 0) return null;
  
  return res.data[0];
}

// Term queries
export async function getAllTerms(page = 1, pageSize = 12, search = '') {
  const query = qs.stringify({
    populate: {
      author: true,
      categories: true
    },
    sort: ['createdAt:desc'],
    pagination: {
      page,
      pageSize
    },
    ...(search ? {
      filters: {
        title: {
          $containsi: search
        }
      }
    } : {})
  });
  
  const path = "/api/terms";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 } });
  
  return {
    data: res.data,
    meta: res.meta
  };
}

export async function getTermsPaginated(page: number = 1, pageSize: number = 12): Promise<Term[]> {
  const query = qs.stringify({
    populate: {
      author: true,
      categories: true
    },
    sort: ['createdAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/terms";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 } });
  
  return res.data || [];
}

export async function getTermBySlug(slug: string): Promise<Term | null> {
  const query = qs.stringify({
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: {
      author: true,
      categories: true
    }
  });
  
  const path = "/api/terms";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 } });
  
  return res.data?.[0] || null;
}

export async function getEmailIssueCategories() {
  const path = "/api/email-issue-categories";
  const url = new URL(path, BASE_URL);
  
  url.search = qs.stringify({
    filters: {
      isActive: true
    },
    sort: 'order:asc'
  });
  
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 1 } });
  
  return res;
}

