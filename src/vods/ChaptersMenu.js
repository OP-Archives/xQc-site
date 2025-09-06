import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Typography, Tooltip } from "@mui/material";
import CustomLink from "../utils/CustomLink";
import humanize from "humanize-duration";
import { toHMS } from "../utils/helpers";

export default function Chapters(props) {
  const { vod, isCdnAvailable } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const DEFAULT_VOD = vod.youtube.length > 0 ? `/youtube/${vod.id}` : Date.now() - new Date(vod.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000 && isCdnAvailable ? `/cdn/${vod.id}` : `#`;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Tooltip title={vod.chapters[0].name ?? "Chapter 1"}>
        <IconButton onClick={handleClick}>
          <img alt="" src={getImage(vod.chapters[0].image)} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.chapters.map((data, _) => {
          return (
            <CustomLink key={data.gameId + data.start} href={`${DEFAULT_VOD}?t=${toHMS(data?.start || 1)}`}>
              <MenuItem>
                <Box sx={{ display: "flex" }}>
                  <Box sx={{ mr: 1 }}>
                    <img alt="" src={getImage(data.image)} style={{ width: "40px", height: "53px" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography color="inherit" variant="body2">{`${data.name ?? "Chapter 1"}`}</Typography>
                    <Typography variant="caption">{`${humanize(data.end * 1000, { largest: 2 })}`}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            </CustomLink>
          );
        })}
      </Menu>
    </Box>
  );
}

//Support older vods that had {width}x{height} in the link
const getImage = (link) => {
  if (!link) return `https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg`;
  return link.replace("{width}x{height}", "40x53");
};
