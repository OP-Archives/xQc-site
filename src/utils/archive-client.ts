const TENANT_ID = import.meta.env.VITE_CHANNEL.toLowerCase();
const apiBase = import.meta.env.VITE_ARCHIVE_API_BASE;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ListParams {
  platform?: string;
  from?: string;
  to?: string;
  uploaded?: string;
  game?: string;
  game_id?: string;
  title?: string;
  chapter?: string;
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
}

interface GameListParams {
  game_name?: string;
  title?: string;
  platform?: string;
  from?: string;
  to?: string;
  game_id?: string;
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
}

interface LibraryParams {
  game_id?: string;
  game_name?: string;
  chapter_name?: string;
  sort?: string;
  order?: string;
  page?: number | string;
  limit?: number | string;
}

interface ApiResponse<T> {
  data: T[];
  meta: { total: number };
}

export interface VodUpload {
  thumbnail_url?: string;
}

export interface GameItem {
  thumbnail_url?: string;
}

export interface ChapterItem {
  name: string;
  image: string;
  game_id?: string;
  start?: number;
  end?: number;
  duration?: number;
}

export interface VodData {
  id: string;
  title: string;
  created_at: string;
  duration: number;
  is_live?: boolean;
  platform?: string;
  thumbnail_url?: string;
  chapters?: ChapterItem[];
  vod_uploads: VodUpload[];
  games: GameItem[];
}

export interface LibraryChapterItem {
  game_id: string;
  name: string;
  image?: string;
  count: number;
}

export interface LibraryGameItem {
  game_id: string;
  game_name: string;
  chapter_image?: string;
  count: number;
}

export interface GameData {
  id: string;
  vod_id: string;
  title: string;
  created_at: string;
  duration: number;
  thumbnail_url?: string;
  chapters?: ChapterItem[];
  game_name?: string;
  chapter_image?: string;
}

const buildParams = (params: object) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && key !== 'signal') {
      query.set(key, String(value));
    }
  }
  return query;
};

async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 8000);

  let signal: AbortSignal = timeoutController.signal;
  if (options.signal) {
    const combined = new AbortController();
    const handler = () => combined.abort();
    options.signal.addEventListener('abort', handler, { once: true });
    timeoutController.signal.addEventListener('abort', () => combined.abort(), { once: true });
    signal = combined.signal;
  }

  try {
    const res = await window.fetch(url, {
      ...options,
      signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function listVods(params: ListParams & { signal?: AbortSignal } = {}): Promise<ApiResponse<VodData>> {
  const url = `${apiBase}/${TENANT_ID}/vods?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getVod(vodId: string, options: { signal?: AbortSignal } = {}): Promise<ApiResponse<VodData>> {
  return fetchJson(`${apiBase}/${TENANT_ID}/vods/${vodId}`, { signal: options.signal });
}

export async function getVodByPlatform(
  platform: string,
  platformVodId: string,
  options: { signal?: AbortSignal } = {}
): Promise<ApiResponse<VodData>> {
  return fetchJson(`${apiBase}/${TENANT_ID}/vods/${platform}/${platformVodId}`, { signal: options.signal });
}

export async function listGames(
  params: GameListParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<GameData>> {
  const url = `${apiBase}/${TENANT_ID}/games?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getGamesLibrary(
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<LibraryGameItem>> {
  const url = `${apiBase}/${TENANT_ID}/games/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getChaptersLibrary(
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<LibraryChapterItem>> {
  const url = `${apiBase}/${TENANT_ID}/chapters/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}
