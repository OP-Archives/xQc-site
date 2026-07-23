export const toHMS = (secs: number | string) => {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;
  return `${hours}h${minutes}m${seconds}s`;
};

export const toHHMMSS = (secs: number | string) => {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v: number) => (v < 10 ? '0' + v : String(v)))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getImage = (link: string | undefined, width = 40, height = 53) => {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
};

export const getVodLink = (vod: { id: string; created_at: string; is_live?: boolean; vod_uploads?: { thumbnail_url?: string }[]; games?: { thumbnail_url?: string }[] }) => {
  if (vod.vod_uploads?.length > 0) return `/youtube/${vod.id}`;
  if (Date.now() - new Date(vod.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000 && !vod.is_live) return `/cdn/${vod.id}`;
  if (vod.games?.length > 0) return `/games/${vod.id}`;
  return null;
};
