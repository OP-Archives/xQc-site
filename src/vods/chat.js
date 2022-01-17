import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Menu, MenuItem, Pagination, Grid, Tooltip, Link, Divider, Collapse, styled, IconButton } from "@mui/material";
import SimpleBar from "simplebar-react";
import Loading from "../utils/Loading";
import Moment from "moment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const GLOBAL_TWITCH_BADGES_API = "https://badges.twitch.tv/v1/badges/global/display?language=en";
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://api.frankerfacez.com/v1";
const BASE_BTTV_EMOTE_CDN = "https://cdn.betterttv.net";
const BASE_7TV_EMOTE_CDN = "https://api.7tv.app/v2";

export default function Chat(props) {
  const { isMobile } = props;
  const [showChat, setShowChat] = useState(true);

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  return (
    <Box sx={{ height: "100%", background: "#131314" }}>
      {showChat ? (
        <>
          <Box sx={{ display: "grid", alignItems: "center", p: 1 }}>
            {!isMobile && (
              <Box sx={{ justifySelf: "left", gridColumnStart: 1, gridRowStart: 1 }}>
                <Tooltip title="Collapse">
                  <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                    <ExpandMoreIcon />
                  </ExpandMore>
                </Tooltip>
              </Box>
            )}
            <Box sx={{ justifySelf: "center", gridColumnStart: 1, gridRowStart: 1 }}>
              <Typography variant="body1">Chat Replay</Typography>
            </Box>
          </Box>
          <Divider />
          <Collapse in={showChat} timeout="auto" unmountOnExit sx={{ minHeight: "auto !important" }}>
            <></>
          </Collapse>
        </>
      ) : (
        !isMobile && (
          <Box sx={{ position: "absolute", right: 0 }}>
            <Tooltip title="Expand">
              <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                <ExpandMoreIcon />
              </ExpandMore>
            </Tooltip>
          </Box>
        )
      )}
    </Box>
  );
}

const ExpandMore = styled(React.forwardRef(({ expand, ...props }, ref) => <IconButton {...props} />))`
  margin-left: auto;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  ${(props) =>
    props.expand
      ? `
          transform: rotate(-90deg);
        `
      : `
          transform: rotate(90deg);
        `}
`;
