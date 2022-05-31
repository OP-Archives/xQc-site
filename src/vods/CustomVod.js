import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, MenuItem, Tooltip, useMediaQuery, IconButton, Link, Collapse, styled, Menu, Divider, TextField, InputAdornment } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomPlayer from "./CustomPlayer";
import Chat from "./CustomChat";
import { tooltipClasses } from "@mui/material/Tooltip";
import humanize from "humanize-duration";
import debounce from "lodash.debounce";

const API_BASE = "https://api.xqc.wtf";

export default function Vod(props) {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { vodId } = useParams();
  const { type } = props;
  const [vod, setVod] = useState(undefined);
  const [drive, setDrive] = useState(undefined);
  const [chapter, setChapter] = useState(undefined);
  const [showMenu, setShowMenu] = useState(true);
  const [currentTime, setCurrentTime] = useState(undefined);
  const [playing, setPlaying] = useState({ playing: false });
  const search = new URLSearchParams(location.search);
  const [initalDuration, setInitalDuration] = useState(search.get("duration") !== null ? parseInt(search.get("duration")) : 0);
  const [delay, setDelay] = useState(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
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
    setDrive(vod.drive.filter((data) => data.type === "live"));
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

  const handleExpandClick = () => {
    setShowMenu(!showMenu);
  };

  const delayChange = (evt) => {
    if (evt.target.value.length === 0) return;
    const value = Number(evt.target.value);
    if (isNaN(value)) return;
    setUserChatDelay(value);
  };

  const debouncedDelay = useMemo(() => debounce(delayChange, 300), []);

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
  }, [userChatDelay, delay]);

  if (vod === undefined || drive === undefined || chapter === undefined) return <Loading />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%", width: "100%" }}>
        <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "flex-start", minWidth: 0, overflow: "hidden" }}>
          <CustomPlayer playerRef={playerRef} setCurrentTime={setCurrentTime} setPlaying={setPlaying} delay={delay} setDelay={setDelay} type={type} vod={vod} initalDuration={initalDuration} />
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
              {chapter && <ChaptersMenu chapters={vod.chapters} chapter={chapter} setChapter={setChapter} setInitalDuration={setInitalDuration} />}
              <CustomWidthTooltip title={vod.title}>
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ml: 1 }}>
                  <Typography>{`${vod.title}`}</Typography>
                </Box>
              </CustomWidthTooltip>
              <Box sx={{ ml: 1 }}>
                {drive && drive[0] && (
                  <Tooltip title={`Download Vod`}>
                    <IconButton component={Link} href={`https://drive.google.com/u/2/uc?id=${drive[0].id}`} color="primary" aria-label="Download Vod" rel="noopener noreferrer" target="_blank">
                      <CloudDownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box sx={{ ml: 1, mr: 1 }}>
                <TextField
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">secs</InputAdornment>,
                  }}
                  sx={{ width: 100 }}
                  onChange={debouncedDelay}
                  label="Chat Delay"
                  variant="filled"
                  size="small"
                  defaultValue={userChatDelay}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>
        {isMobile && <Divider />}
        {<Chat isMobile={isMobile} vodId={vodId} playerRef={playerRef} playing={playing} currentTime={currentTime} delay={delay} userChatDelay={userChatDelay} />}
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
  const { chapters, chapter, setInitalDuration, setChapter } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (data) => {
    setInitalDuration(data.start);
    setChapter(data);
    setAnchorEl(null);
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
};
