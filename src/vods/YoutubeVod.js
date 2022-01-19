import React, { useEffect, useState } from "react";
import { Box, Typography, MenuItem, Tooltip, useMediaQuery, FormControl, InputLabel, Select, IconButton, Link, Collapse, styled, Menu, Divider } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import YoutubePlayer from "./YoutubePlayer";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotFound from "../utils/NotFound";
import Chat from "./YoutubeChat";
import { tooltipClasses } from "@mui/material/Tooltip";
import humanize from "humanize-duration";

const API_BASE = "https://api.xqc.wtf";

export default function Vod(props) {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { vodId } = useParams();
  const { type } = props;
  const [vod, setVod] = useState(undefined);
  const [youtube, setYoutube] = useState(undefined);
  const [drive, setDrive] = useState(undefined);
  const [chapter, setChapter] = useState(undefined);
  const [part, setPart] = useState(undefined);
  const [showMenu, setShowMenu] = useState(true);
  const [currentTime, setCurrentTime] = useState(undefined);
  const [playing, setPlaying] = useState({ playing: false });
  const [delay, setDelay] = useState(0);
  const playerRef = React.useRef(null);

  useEffect(() => {
    const fetchVod = async () => {
      await fetch(`${API_BASE}/vods/${vodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setVod(response);
          document.title = `${response.id} - xQc`;
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVod();
    return;
  }, [vodId]);

  useEffect(() => {
    if (!vod) return;
    setYoutube(vod.youtube.filter((data) => data.type === type));
    setDrive(vod.drive.filter((data) => data.type === type));
    const search = new URLSearchParams(location.search);
    let duration = search.get("duration") !== null ? parseInt(search.get("duration")) : 0;
    let tmpPart = search.get("part") !== null ? parseInt(search.get("part")) : 1;
    if (duration > 0) {
      for (let data of vod.youtube) {
        if (data.duration > duration) {
          tmpPart = data.part;
          break;
        }
        duration -= data.duration;
      }
    }
    setPart({ part: tmpPart, duration: duration });
    setChapter(vod.chapters ? vod.chapters[0] : null);
    return;
  }, [vod, type, location.search]);

  useEffect(() => {
    if (!playerRef.current || !vod || !vod.chapters) return;
    for (let chapter of vod.chapters) {
      if (currentTime > chapter.start && currentTime < chapter.start + chapter.end) {
        setChapter(chapter);
        break;
      }
    }
  }, [currentTime, vod, playerRef]);

  useEffect(() => {
    if (!youtube || !vod) return;
    const vodDuration = toSeconds(vod.duration);
    let totalYoutubeDuration = 0;
    for (let data of youtube) {
      totalYoutubeDuration += data.duration;
    }
    const tmpDelay = vodDuration - totalYoutubeDuration < 0 ? 0 : vodDuration - totalYoutubeDuration;
    console.info(`Chat Delay: ${tmpDelay} seconds`);
    setDelay(tmpDelay);
  }, [youtube, vod]);

  const handlePartChange = (evt) => {
    const tmpPart = evt.target.value + 1;
    setPart({ part: tmpPart, duration: 0 });
  };

  const handleExpandClick = () => {
    setShowMenu(!showMenu);
  };

  if (part === undefined) return <Loading />;

  if (youtube.length === 0) return <NotFound />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%", width: "100%" }}>
        <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "flex-start", minWidth: 0, overflow: "hidden" }}>
          <YoutubePlayer playerRef={playerRef} part={part} youtube={youtube} setCurrentTime={setCurrentTime} setPart={setPart} setPlaying={setPlaying} delay={delay} />
          {!isMobile && (
            <Box sx={{ position: "absolute", bottom: 0, left: "40%" }}>
              <Tooltip title={showMenu ? "Collapse" : "Expand"}>
                <ExpandMore expand={showMenu} onClick={handleExpandClick} aria-expanded={showMenu} aria-label="show menu">
                  <ExpandMoreIcon />
                </ExpandMore>
              </Tooltip>
            </Box>
          )}
          <Collapse in={showMenu} timeout="auto" unmountOnExit sx={{ minHeight: "auto !important", width: "100%" }}>
            <Box sx={{ display: "flex", p: 1, alignItems: "center" }}>
              {chapter && <ChaptersMenu chapters={vod.chapters} chapter={chapter} setPart={setPart} youtube={youtube} setChapter={setChapter} />}
              <CustomWidthTooltip title={vod.title}>
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ml: 1 }}>
                  <Typography>{`${vod.title}`}</Typography>
                </Box>
              </CustomWidthTooltip>
              <Box sx={{ ml: 1 }}>
                <FormControl variant="standard" sx={{ p: 1, maxWidth: "80px", minWidth: "40px" }}>
                  <InputLabel id="select-label">Part</InputLabel>
                  <Select labelId="select-label" value={part.part - 1} onChange={handlePartChange} autoWidth>
                    {youtube.map((data, i) => {
                      return (
                        <MenuItem key={data.id} value={i}>
                          {data.part}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ ml: 1 }}>
                {drive && drive[0] && (
                  <Tooltip title={`Download Vod`}>
                    <IconButton component={Link} href={`https://drive.google.com/u/2/uc?id=${drive[0].id}`} color="primary" aria-label="Download Vod" rel="noopener noreferrer" target="_blank">
                      <CloudDownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
        {isMobile && <Divider />}
        <Chat isMobile={isMobile} vodId={vodId} playerRef={playerRef} playing={playing} currentTime={currentTime} delay={delay} youtube={youtube} part={part} setPart={setPart} />
      </Box>
    </Box>
  );
}

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const ExpandMore = styled(React.forwardRef(({ expand, ...props }, ref) => <IconButton {...props} />))`
  margin-left: auto;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  ${(props) =>
    props.expand
      ? `
          transform: rotate(180deg);
        `
      : `
          transform: rotate(0deg);
        `}
`;

const ChaptersMenu = (props) => {
  const { chapters, chapter, setPart, youtube, setChapter } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (data) => {
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
                  <Typography variant="caption" color="textSecondary" noWrap>{`${humanize(data.end * 1000)}`}</Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

const toSeconds = (hms) => {
  const time = hms.split(":");

  return +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
};
