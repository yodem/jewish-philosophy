import type { Playlist, Video } from "@/types";

function toTimestamp(value?: string | null): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function videoActivityDate(video: Video): string | undefined {
  return video.publishedAt || video.updatedAt || video.createdAt;
}

/** Newest lecture (or playlist) timestamp — not the original Strapi playlist publish date. */
export function latestPlaylistActivityDate(playlist: Playlist): string | undefined {
  const candidates = [
    ...(playlist.videos ?? []).map(videoActivityDate),
    playlist.updatedAt,
    playlist.publishedAt,
    playlist.createdAt,
  ].filter((value): value is string => Boolean(value));

  if (candidates.length === 0) return undefined;

  return candidates.reduce((latest, current) =>
    toTimestamp(current) > toTimestamp(latest) ? current : latest
  );
}

export function sortPlaylistsByLatestActivity(playlists: Playlist[]): Playlist[] {
  return [...playlists].sort((a, b) => {
    return toTimestamp(latestPlaylistActivityDate(b)) - toTimestamp(latestPlaylistActivityDate(a));
  });
}
