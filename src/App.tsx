import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GamesPage from './games/Games';
import GamesLibrary from './games/GamesLibrary';
import Frontpage from './Frontpage';
import Navbar from './navbar/navbar';
import ErrorBoundary from './utils/ErrorBoundary';
import Vods from './vods/Vods';
import NotFound from './utils/NotFound';
import '@op-archives/vod-components/index.css';
import { YoutubeVod, CustomVod, Games } from '@op-archives/vod-components';

const channel = import.meta.env.VITE_CHANNEL;
const logo = '/loading.gif';
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = Number(import.meta.env.VITE_DEFAULT_DELAY);
const twitchId = Number(import.meta.env.VITE_TWITCH_ID);
const cdnBase = import.meta.env.VITE_CDN;

function AppLayout() {
  return (
    <>
      <Navbar channel={channel} />
      <main className="relative mx-auto flex min-h-0 w-full flex-1 flex-col max-w-full">
        <Routes>
          <Route path="/" element={<Frontpage />} />
          <Route path="/vods" element={<Vods />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/library" element={<GamesLibrary />} />
          <Route path="*" element={<NotFound channel={channel} />} />
          <Route
            path="/vods/:vodId"
            element={
              <YoutubeVod
                type="vod"
                logo={logo}
                origin={origin}
                channel={channel}
                archiveApiBase={archiveApiBase}
                defaultDelay={defaultDelay}
                twitchId={twitchId}
              />
            }
          />
          <Route
            path="/live/:vodId"
            element={
              <YoutubeVod
                type="live"
                logo={logo}
                origin={origin}
                channel={channel}
                archiveApiBase={archiveApiBase}
                defaultDelay={defaultDelay}
                twitchId={twitchId}
              />
            }
          />
          <Route
            path="/youtube/:vodId"
            element={
              <YoutubeVod
                logo={logo}
                origin={origin}
                channel={channel}
                archiveApiBase={archiveApiBase}
                defaultDelay={defaultDelay}
                twitchId={twitchId}
              />
            }
          />
          <Route
            path="/games/:vodId"
            element={
              <Games channel={channel} logo={logo} origin={origin} archiveApiBase={archiveApiBase} twitchId={twitchId} />
            }
          />
          <Route
            path="/manual/:vodId"
            element={
              <CustomVod
                type="manual"
                logo={logo}
                channel={channel}
                archiveApiBase={archiveApiBase}
                twitchId={twitchId}
              />
            }
          />
          <Route
            path="/cdn/:vodId"
            element={
              <CustomVod
                type="cdn"
                logo={logo}
                channel={channel}
                archiveApiBase={archiveApiBase}
                twitchId={twitchId}
                cdnBase={cdnBase}
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-dark">
      <BrowserRouter>
        <ErrorBoundary channel={channel}>
          <div className="flex min-h-0 flex-1 flex-col">
            <AppLayout />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}
