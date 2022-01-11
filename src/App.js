import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, styled } from "@mui/material";
import { blue } from "@mui/material/colors";
import Frontpage from "./frontpage";
import Vods from "./vods/vods";
import VodPlayer from "./vods/player";
import Navbar from "./navbar";

export default function App() {
  let darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#0e0e10",
      },
      primary: {
        main: blue[600],
      },
      secondary: {
        main: "#292828",
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
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Parent>
                <Navbar />
                <Frontpage />
              </Parent>
            }
          />
          <Route
            exact
            path="/vods"
            element={
              <Parent>
                <Navbar />
                <Vods />
              </Parent>
            }
          />
          <Route
            exact
            path="/vods/:vodId"
            element={
              <Parent>
                <VodPlayer />
              </Parent>
            }
          />
          <Route
            exact
            path="/live/:vodId"
            element={
              <Parent>
                <VodPlayer />
              </Parent>
            }
          />
        </Routes>
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
`;
