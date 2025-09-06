import { useState } from "react";
import { Box, Tooltip, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import humanize from "humanize-duration";

export default function Chapters(props) {
  const { chapters, chapter, setPart, youtube, setChapter, setTimestamp } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (data) => {
    if (youtube) {
      let part = 1,
        timestamp = data?.start || 1;
      if (timestamp > 1) {
        for (let data of youtube) {
          if (data.duration > timestamp) {
            part = data.part;
            break;
          }
          timestamp -= data.duration;
        }
      }
      setPart({ part: part, timestamp: timestamp });
    } else {
      setTimestamp(data?.start || 1);
    }
    setChapter(data);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ pr: 1 }}>
      <Tooltip title={chapter.name ?? "Chapter 1"}>
        <IconButton onClick={handleClick}>
          <img alt="" src={getImage(chapter.image)} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} sx={{ maxWidth: "280px", maxHeight: "400px" }}>
        {chapters.map((data, _) => {
          return (
            <MenuItem onClick={() => handleChapterClick(data)} key={data.gameId + data.start} selected={data.start === chapter.start}>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ mr: 1 }}>
                  <img alt="" src={getImage(data.image)} style={{ width: "40px", height: "53px" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography color="inherit" variant="body2" noWrap>{`${data.name ?? "Chapter 1"}`}</Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>{`${humanize(data.end * 1000, { largest: 2 })}`}</Typography>
                </Box>
              </Box>
            </MenuItem>
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
