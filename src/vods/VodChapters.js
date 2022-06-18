import { useState } from "react";
import { Box, Tooltip, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import humanize from "humanize-duration";

export default function Chapters(props) {
  const { chapters, chapter, setPart, youtube, setChapter, setInitalDuration } = props;
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
        duration = data.start;
      if (duration > 0) {
        for (let data of youtube) {
          if (data.duration > duration) {
            part = data.part;
            break;
          }
          duration -= data.duration;
        }
      }
      setPart({ part: part, duration: duration });
      setChapter(data);
    } else {
      setInitalDuration(data.start);
      setChapter(data);
      setAnchorEl(null);
    }
  };

  return (
    <Box>
      <Tooltip title={chapter.name}>
        <IconButton onClick={handleClick}>
          <img alt="" src={chapter.image} style={{ width: "40px", height: "53px" }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} sx={{ maxWidth: "280px", maxHeight: "400px" }}>
        {chapters.map((data, _) => {
          return (
            <MenuItem onClick={() => handleChapterClick(data)} key={data.gameId + data.start} selected={data.start === chapter.start}>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ mr: 1 }}>
                  <img alt="" src={data.image} style={{ width: "40px", height: "53px" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography color="inherit" variant="body2" noWrap>{`${data.name}`}</Typography>
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
