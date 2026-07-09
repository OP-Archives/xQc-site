import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import GamesPage, { gamesLoader } from './games/Games';
import GamesLibrary, { gamesLibraryLoader } from './games/GamesLibrary';
import Frontpage from './Frontpage';
import Navbar from './navbar/navbar';
import { getVod } from './utils/archive-client';
import ErrorBoundary from './utils/ErrorBoundary';
import Loading from './utils/Loading';
import { queryClient } from './utils/queryClient';
import Vods, { vodsLoader } from './vods/Vods';

const NotFound = lazy(() => import('./utils/NotFound'));
const YoutubeVod = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].YoutubeVod,
  }))
);
const CustomVod = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].CustomVod,
  }))
);
const Games = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].Games,
  }))
);

const videoLoader = async ({ params, request }: LoaderFunctionArgs) => {
  if (params.vodId) {
    queryClient.prefetchQuery({
      queryKey: ['vod', params.vodId],
      queryFn: () => getVod(params.vodId as string, { signal: request.signal }),
      staleTime: 5 * 60 * 1000,
    });
  }
  return null;
};

const channel = import.meta.env.VITE_CHANNEL;
const logo = '/loading.gif';
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = Number(import.meta.env.VITE_DEFAULT_DELAY);
const twitchId = Number(import.meta.env.VITE_TWITCH_ID);
const cdnBase = import.meta.env.VITE_CDN;

const MainLayout = () => (
  <>
    <Navbar channel={channel} />
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  </>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route hydrateFallbackElement={<Loading />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Frontpage />} />
        <Route path="/vods" element={<Vods />} loader={vodsLoader} />
        <Route path="/games" element={<GamesPage />} loader={gamesLoader} />
        <Route path="/library" element={<GamesLibrary />} loader={gamesLibraryLoader} />
        <Route path="*" element={<NotFound channel={channel} />} />
      </Route>
      <Route
        path="/vods/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              type="vod"
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/live/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              type="live"
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/youtube/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/games/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <Games channel={channel} logo={logo} origin={origin} archiveApiBase={archiveApiBase} twitchId={twitchId} />
          </Suspense>
        }
      />
      <Route
        path="/manual/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <CustomVod
              type="manual"
              logo={logo}
              channel={channel}
              archiveApiBase={archiveApiBase}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/cdn/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <CustomVod
              type="cdn"
              logo={logo}
              channel={channel}
              archiveApiBase={archiveApiBase}
              twitchId={twitchId}
              cdnBase={cdnBase}
            />
          </Suspense>
        }
      />
    </Route>
  )
);

export default function App() {
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-dark">
      <ErrorBoundary channel={channel}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </div>
  );
}
