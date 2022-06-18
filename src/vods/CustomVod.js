import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Tooltip, useMediaQuery, IconButton, Link, Collapse, Divider, TextField, InputAdornment } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomPlayer from "./CustomPlayer";
import debounce from "lodash.debounce";
import Chat from "./Chat";
import Chapters from "./VodChapters";
import ExpandMore from "../utils/CustomExpandMore";
import CustomWidthTooltip from "../utils/CustomToolTip";

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

  const debouncedDelay = useMemo(() => {
    const delayChange = (evt) => {
      if (evt.target.value.length === 0) return;
      const value = Number(evt.target.value);
      if (isNaN(value)) return;
      setUserChatDelay(value);
    };
    return debounce(delayChange, 300);
  }, []);

  useEffect(() => {
    if (delay === undefined) return;
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
              {chapter && <Chapters chapters={vod.chapters} chapter={chapter} setChapter={setChapter} setInitalDuration={setInitalDuration} />}
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
