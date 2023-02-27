import React, { useEffect, useState } from "react";
import { Box, Typography, MenuItem, Tooltip, useMediaQuery, FormControl, InputLabel, Select, IconButton, Link, Collapse, Divider } from "@mui/material";
import Loading from "../utils/Loading";
import { useLocation, useParams } from "react-router-dom";
import YoutubePlayer from "./Youtube";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotFound from "../utils/NotFound";
import Chat from "../vods/Chat";
import ExpandMore from "../utils/CustomExpandMore";
import CustomToolTip from "../utils/CustomToolTip";

const delay = 0;
const API_BASE = process.env.REACT_APP_VODS_API_BASE;

export default function Games(props) {
  const location = useLocation();
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const { vodId } = useParams();
  const [vod, setVod] = useState(undefined);
  const [games, setGames] = useState(undefined);
  const [drive, setDrive] = useState(undefined);
  const [part, setPart] = useState(undefined);
  const [showMenu, setShowMenu] = useState(true);
  const [playing, setPlaying] = useState({ playing: false });
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
    setDrive(vod.drive.filter((data) => data.type === "vod"));
    setGames(vod.games);
    const search = new URLSearchParams(location.search);
    let tmpPart = search.get("part") !== null ? parseInt(search.get("part")) : 1;
    setPart({ part: tmpPart, timestamp: 0 });
    return;
  }, [vod, location.search]);

  const handlePartChange = (evt) => {
    const tmpPart = evt.target.value + 1;
    setPart({ part: tmpPart, timestamp: 0 });
  };

  const handleExpandClick = () => {
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
  }, [userChatDelay]);

  if (vod === undefined || drive === undefined || part === undefined || delay === undefined) return <Loading />;

  if (games.length === 0) return <NotFound />;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: isPortrait ? "column" : "row", height: "100%", width: "100%" }}>
        <Box sx={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "flex-start", minWidth: 0, overflow: "hidden", position: "relative" }}>
          <YoutubePlayer playerRef={playerRef} part={part} games={games} setPart={setPart} setPlaying={setPlaying} delay={delay} />
          <Box sx={{ position: "absolute", bottom: 0, left: "50%", width: "100%" }}>
            <Tooltip title={showMenu ? "Collapse" : "Expand"}>
              <ExpandMore expand={showMenu} onClick={handleExpandClick} aria-expanded={showMenu} aria-label="show menu">
                <ExpandMoreIcon />
              </ExpandMore>
            </Tooltip>
          </Box>
          <Collapse in={showMenu} timeout="auto" unmountOnExit sx={{ minHeight: "auto !important", width: "100%" }}>
            <Box sx={{ display: "flex", p: 1, alignItems: "center" }}>
              <CustomToolTip title={vod.title}>
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ml: 1 }}>
                  <Typography>{`${vod.title}`}</Typography>
                </Box>
              </CustomToolTip>
              <Box sx={{ ml: 1 }}>
                <FormControl variant="outlined" sx={{ p: 1, minWidth: "40px" }}>
                  <InputLabel id="select-label">Game</InputLabel>
                  <Select labelId="select-label" value={part.part - 1} onChange={handlePartChange} autoWidth>
                    {games.map((data, i) => {
                      return (
                        <MenuItem key={data.id} value={i}>
                          {data.game_name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ ml: 1 }}>
                {drive && drive[0] && (
                  <Tooltip title={`Download Vod`}>
                    <IconButton component={Link} href={`https://drive.google.com/u/2/open?id=${drive[0].id}`} color="secondary" aria-label="Download Vod" rel="noopener noreferrer" target="_blank">
                      <CloudDownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
        {isPortrait && <Divider />}
        <Chat
          isPortrait={isPortrait}
          vodId={vodId}
          playerRef={playerRef}
          playing={playing}
          delay={delay}
          userChatDelay={userChatDelay}
          part={part}
          setPart={setPart}
          games={games}
          setUserChatDelay={setUserChatDelay}
        />
      </Box>
    </Box>
  );
}
