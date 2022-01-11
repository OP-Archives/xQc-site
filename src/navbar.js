import React from "react";
import { AppBar, Toolbar, List, ListItem, ListItemText, Typography, Divider, IconButton, Drawer, useMediaQuery, Box } from "@mui/material";
import Logo from "./assets/loading.gif";
import Menu from "@mui/icons-material/Menu";
import discord from "./assets/discord.png";
import twitter from "./assets/twitter.png";
import soundcloud from "./assets/soundcloud.png";
import reddit from "./assets/reddit.png";
import youtube from "./assets/youtube.png";
import twitch from "./assets/twitch.png";
import CustomLink from "./utils/CustomLink";

const mainLinks = [
  { title: `Home`, path: `/` },
  { title: `Vods`, path: `/vods` },
  { title: `Contest`, path: `/contest` },
  { title: `Merch`, path: `https://metathreads.com/collections/pokelawls` },
];
const socialLinks = [
  { title: `Twitch`, path: `https://twitch.tv/pokelawls` },
  { title: `Twitter`, path: `https://twitter.com/pokelawls` },
  { title: `Reddit`, path: `https://reddit.com/r/pokelawls` },
  { title: `Discord`, path: `https://discord.gg/pokelawls` },
  { title: `Youtube`, path: `https://youtube.com/c/pokelawls` },
  { title: `Soundcloud`, path: `https://soundcloud.com/pokelawls` },
];

export default function Navbar(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <Box sx={{ alignItems: "stretch", justifyContent: "center", display: "flex", flexShrink: 1, flexGrow: 1, mb: 1, mt: 1 }}>
        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <a href="/">
            <img alt="" height="45px" src={Logo} />
          </a>
        </Box>
      </Box>
      <Divider />
      <List>
        {mainLinks.map(({ title, path }) => (
          <ListItem key={title} component={CustomLink} href={path}>
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {socialLinks.map(({ title, path }) => (
          <ListItem key={title} component={CustomLink} href={path} target="_blank" rel="noreferrer noopener">
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  return isMobile ? (
    <Box sx={{ display: "flex" }}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
            <Menu />
          </IconButton>
          <Box sx={{ alignItems: "stretch", justifyContent: "center", display: "flex", flexShrink: 1, flexGrow: 1, mb: 1, mt: 1 }}>
            <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <a href="/">
                <img alt="" height="45px" src={Logo} />
              </a>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <nav aria-label="navigation">
        <Drawer
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  ) : (
    <Box sx={{ display: "flex", backgroundColor: "#1d1d1d", alignItems: "stretch", flexWrap: "nowrap" }}>
      <Box sx={{ alignItems: "stretch", justifyContent: "flex-start", width: "100%", display: "flex", flexShrink: 1, flexGrow: 1, flexWrap: "nowrap" }}>
        <Box sx={{ ml: 1, display: "flex", justifyContent: "space-between", flexDirection: "row", height: "100%" }}>
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}>
            <a href="https://twitter.com/pokelawls" target="_blank" rel="noopener noreferrer">
              <img alt="" height="auto" width="35px" src={twitter} />
            </a>
          </Box>
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}>
            <a href="https://discord.gg/pokelawls" target="_blank" rel="noopener noreferrer">
              <img alt="" height="auto" width="45px" src={discord} />
            </a>
          </Box>
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}>
            <a href="https://soundcloud.com/pokelawls" target="_blank" rel="noopener noreferrer">
              <img alt="" height="auto" width="45px" src={soundcloud} />
            </a>
          </Box>
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}>
            <a href="https://reddit.com/r/pokelawls" target="_blank" rel="noopener noreferrer">
              <img alt="" height="auto" width="42px" src={reddit} />
            </a>
          </Box>
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", mr: 0.5 }}>
            <a href="https://youtube.com/c/pokelawls" target="_blank" rel="noopener noreferrer">
              <img alt="" height="auto" width="45px" src={youtube} />
            </a>
          </Box>
        </Box>
      </Box>
      <Box sx={{ alignItems: "center", display: "flex", flexGrow: 1, flexShrink: 1, width: "100%", justifyContent: "center" }}>
        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <a href="/">
            <img alt="" height="45px" src={Logo} />
          </a>
        </Box>
      </Box>
      <Box sx={{ alignItems: "center", display: "flex", flexGrow: 1, flexShrink: 1, width: "100%", justifyContent: "flex-end", mr: 1 }}>
        <Box sx={{ display: "flex", mr: 1 }}>
          <CustomLink href="/contest">
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Box sx={{ ml: 1 }}>
                <Typography>Contest</Typography>
              </Box>
            </Box>
          </CustomLink>
        </Box>
        <Box sx={{ display: "flex", mr: 1 }}>
          <CustomLink href="/vods">
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Box sx={{ ml: 1 }}>
                <Typography>Vods</Typography>
              </Box>
            </Box>
          </CustomLink>
        </Box>
        <Box sx={{ display: "flex", ml: 1, mr: 1 }}>
          <CustomLink href="https://twitch.tv/pokelawls" target="_blank" rel="noopener noreferrer">
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img alt="" height="auto" width="38px" src={twitch} />
              <Box sx={{ ml: 1 }}>
                <Typography>Watch me Live</Typography>
              </Box>
            </Box>
          </CustomLink>
        </Box>
      </Box>
    </Box>
  );
}
