import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Typography, Tooltip } from "@mui/material";
import CustomLink from "../utils/CustomLink";
import humanize from "humanize-duration";

export default function Chapters(props) {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const DEFAULT_VOD = vod.youtube.length > 0 ? `/youtube/${vod.id}` : Date.now() - new Date(vod.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 ? `/cdn/${vod.id}` : `/manual/${vod.id}`;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Tooltip title={vod.chapters[0].name}>
        <IconButton onClick={handleClick}>
          <img alt="" src={vod.chapters[0].image} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.chapters.map((data, _) => {
          return (
            <CustomLink key={data.gameId + data.start} href={`${DEFAULT_VOD}?duration=${data?.start || 0}`}>
              <MenuItem>
                <Box sx={{ display: "flex" }}>
                  <Box sx={{ mr: 1 }}>
                    <img alt="" src={data.image} style={{ width: "40px", height: "53px" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography color="inherit" variant="body2">{`${data.name}`}</Typography>
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
