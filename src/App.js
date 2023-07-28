import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, styled } from "@mui/material";
import Loading from "./utils/Loading";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Vods = lazy(() => import("./vods/Vods"));
const YoutubeVod = lazy(() => import("./vods/YoutubeVod"));
const CustomVod = lazy(() => import("./vods/CustomVod"));
const Games = lazy(() => import("./games/Games"));
const Navbar = lazy(() => import("./navbar/Navbar"));
const NotFound = lazy(() => import("./utils/NotFound"));

export default function App() {
  let darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#0e0e10",
      },
      primary: {
        main: "#fff",
      },
      secondary: {
        main: "#d62e29",
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: "white",
            backgroundImage: "none",
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Parent>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="*" element={<NotFound />} />
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
                <Route exact path="/youtube/:vodId" element={<YoutubeVod type="live" />} />
                <Route exact path="/manual/:vodId" element={<CustomVod type="manual" />} />
                <Route exact path="/cdn/:vodId" element={<CustomVod type="cdn" />} />
                <Route exact path="/games/:vodId" element={<Games />} />
              </Routes>
            </Suspense>
          </Parent>
        </LocalizationProvider>
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
