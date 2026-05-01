import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';
import Loading from './utils/Loading';
import ErrorBoundary from './utils/ErrorBoundary';
import Logo from './assets/logo.png';

const channel = import.meta.env.VITE_CHANNEL;
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = import.meta.env.VITE_DEFAULT_DELAY;
const twitchId = import.meta.env.VITE_TWITCH_ID;
const cdnBase = import.meta.env.VITE_CDN;

const Vods = lazy(() => import('./vods/Vods'));
const Navbar = lazy(() => import('./navbar/Navbar'));
const NotFound = lazy(() => import('./utils/NotFound'));
const YoutubeVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.YoutubeVod })));
const CustomVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.CustomVod })));
const Games = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.Games })));

export default function App() {
  let darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#0e0e10',
      },
      primary: {
        main: '#fff',
      },
      secondary: {
        main: '#d62e29',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: 'white',
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  darkTheme = responsiveFontSizes(darkTheme);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Parent>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary channel={channel}>
              <Routes>
                <Route path="*" element={<NotFound channel={channel} />} />
                <Route
                  exact
                  path="/"
                  element={
                    <>
                      <Navbar />
                      <Vods />
                    </>
                  }
                />
                <Route
                  exact
                  path="/vods"
                  element={
                    <>
                      <Navbar />
                      <Vods />
                    </>
                  }
                />
                <Route
                  exact
                  path="/youtube/:vodId"
                  element={
                    <YoutubeVod
                      logo={Logo}
                      origin={origin}
                      channel={channel}
                      archiveApiBase={archiveApiBase}
                      defaultDelay={defaultDelay}
                      twitchId={twitchId}
                    />
                  }
                />
                <Route
                  exact
                  path="/cdn/:vodId"
                  element={
                    <CustomVod
                      type="cdn"
                      logo={Logo}
                      channel={channel}
                      archiveApiBase={archiveApiBase}
                      twitchId={twitchId}
                      cdnBase={cdnBase}
                    />
                  }
                />
                <Route
                  exact
                  path="/manual/:vodId"
                  element={
                    <CustomVod
                      type="manual"
                      logo={Logo}
                      channel={channel}
                      archiveApiBase={archiveApiBase}
                      twitchId={twitchId}
                      cdnBase={cdnBase}
                    />
                  }
                />
                <Route
                  exact
                  path="/games/:vodId"
                  element={
                    <Games
                      channel={channel}
                      logo={Logo}
                      origin={origin}
                      archiveApiBase={archiveApiBase}
                      twitchId={twitchId}
                    />
                  }
                />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </Parent>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const Parent = styled((props) => <div {...props} />)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
