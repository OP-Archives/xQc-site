import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import Thumbnail from "../assets/default_thumbnail.png";
import Chapters from "./ChaptersMenu";
import WatchMenu from "./WatchMenu";
import CustomWidthTooltip from "../utils/CustomToolTip";
import { useState } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
dayjs.extend(localizedFormat);

export default function Vod(props) {
  const { vod, gridSize, isCdnAvailable } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const DEFAULT_THUMBNAIL = vod.thumbnail_url ? vod.thumbnail_url : vod.games.length > 0 ? vod.games[0].thumbnail_url : Thumbnail;

  return (
    <Grid item xs={gridSize} sx={{ maxWidth: "18rem", flexBasis: "18rem" }}>
      <Box
        sx={{
          overflow: "hidden",
          height: 0,
          paddingTop: "56.25%",
          position: "relative",
          "&:hover": {
            boxShadow: "0 0 8px #fff",
          },
        }}
      >
        <img style={{ cursor: "pointer" }} onClick={(e) => setAnchorEl(e.currentTarget)} className="thumbnail" alt="" src={DEFAULT_THUMBNAIL} />
        <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <Box sx={{ position: "absolute", bottom: 0, left: 0 }}>
            <Typography variant="caption" sx={{ p: 0.3, backgroundColor: "rgba(0,0,0,.6)" }}>
              {`${dayjs(vod.createdAt).format('LL')}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
            <Typography variant="caption" sx={{ p: 0.3, backgroundColor: "rgba(0,0,0,.6)" }}>
              {`${vod.duration}`}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 1, mb: 1, display: "flex" }}>
        {vod.chapters && vod.chapters.length > 0 && <Chapters vod={vod} isCdnAvailable={isCdnAvailable} />}
        <Box sx={{ minWidth: 0, width: "100%" }}>
          <Box sx={{ p: 0.5 }}>
            <CustomWidthTooltip title={vod.title} placement="top">
              <span>
                <Button onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ width: "100%" }} size="small">
                  <Typography fontWeight={550} variant="caption" color="primary" noWrap={true}>
                    {vod.title}
                  </Typography>
                </Button>
              </span>
            </CustomWidthTooltip>
          </Box>
          <WatchMenu vod={vod} anchorEl={anchorEl} setAnchorEl={setAnchorEl} isCdnAvailable={isCdnAvailable} />
        </Box>
      </Box>
    </Grid>
  );
}
