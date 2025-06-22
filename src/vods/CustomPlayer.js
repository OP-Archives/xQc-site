import React, { useRef, useEffect, useState } from "react";
import canAutoPlay from "can-autoplay";
import { Button, Box, Alert, Paper } from "@mui/material";
import VideoJS from "./VideoJS";
import "videojs-hotkeys";
import { toSeconds } from "../utils/helpers";

const CDN_BASE = "https://cdn.xqc.wtf";

export default function Player(props) {
  const { playerRef, setCurrentTime, setPlaying, type, vod, timestamp, delay, setDelay } = props;
  const timeUpdateRef = useRef(null);
  const [source, setSource] = useState(undefined);
  const [fileError, setFileError] = useState(undefined);
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: false,
    fluid: false,
    liveui: true,
    poster: vod.thumbnail_url,
  };

  // Save current position to localStorage
  const savePosition = (player) => {
    if (!player) return;
    const currentTime = player.currentTime();
    localStorage.setItem(`video-position-${vod.id}`, currentTime);
  };

  const clearPosition = () => {
    localStorage.removeItem(`video-position-${vod.id}`);
  };

  const onReady = (player) => {
    playerRef.current = player;

    player.hotkeys({
      alwaysCaptureHotkeys: true,
      volumeStep: 0.1,
      seekStep: 5,
      enableModifiersForNumbers: false,
      enableMute: true,
      enableFullscreen: true,
    });

    canAutoPlay.video().then(({ result }) => {
      if (!result) playerRef.current.muted(true);
    });

    // Restore last position after metadata is loaded
    player.on("loadedmetadata", function () {
      // If a timestamp is provided, prefer it, else restore from localStorage
      if (timestamp) {
        player.currentTime(timestamp);
      } else {
        const savedPosition = localStorage.getItem(`video-position-${vod.id}`);
        if (savedPosition) {
          const position = parseFloat(savedPosition);
          if (!isNaN(position)) {
            player.currentTime(position);
          }
        }
      }
    });

    // Save position every 5 seconds
    player.on("timeupdate", () => {
      if (Math.floor(player.currentTime()) % 5 === 0) {
        savePosition(player);
      }
    });

    player.on("pause", () => {
      savePosition(player);
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    player.on("end", () => {
      clearPosition();
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    player.on("error", () => {
      const error = player.error();
      if (error && error.code === 4 && type === "cdn") {
        setSource(`${CDN_BASE}/videos/${vod.id}.mp4`);
      }
    });

    if (type === "cdn") setSource(`${CDN_BASE}/videos/${vod.id}/${vod.id}.m3u8`);
  };

  const timeUpdate = () => {
    if (!playerRef.current) return;
    if (playerRef.current.paused()) return;
    let currentTime = 0;
    currentTime += playerRef.current.currentTime();
    currentTime += delay;
    setCurrentTime(currentTime);
  };

  const loopTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
    timeUpdateRef.current = setTimeout(() => {
      timeUpdate();
      loopTimeUpdate();
    }, 1000);
  };

  const clearTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
  };

  const fileChange = (evt) => {
    setFileError(false);
    const file = evt.target.files[0];
    if (file.type.split("/")[0] !== "video") {
      return setFileError("It has to be a valid video file!");
    }

    setSource({ src: URL.createObjectURL(file), type: file.type });
  };

  useEffect(() => {
    if (!source || !playerRef.current) return;
    playerRef.current.src(source);

    // Delay/duration logic
    const set = async () => {
      let playerDuration = playerRef.current.duration();
      while (isNaN(playerDuration) || playerDuration === 0) {
        playerDuration = playerRef.current.duration();
        await sleep(100);
      }
      const vodDuration = toSeconds(vod.duration);
      const tmpDelay = vodDuration - playerDuration < 0 ? 0 : vodDuration - playerDuration;
      setDelay(tmpDelay);
    };
    set();
  }, [source, playerRef, vod, setDelay]);

  // On unmount, save position
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        savePosition(playerRef.current);
      }
    };
  }, [vod.id]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      {type === "manual" && !source && (
        <Paper sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column" }}>
          {fileError && <Alert severity="error">{fileError}</Alert>}
          <Box sx={{ mt: 1 }}>
            <Button variant="contained" component="label">
              Select Video
              <input type="file" hidden onChange={fileChange} accept="video/*,.mkv" />
            </Button>
          </Box>
        </Paper>
      )}
      <Box style={{ visibility: !source ? "hidden" : "visible", height: "100%", width: "100%", outline: "none" }}>
        <VideoJS options={videoJsOptions} onReady={onReady} />
      </Box>
    </Box>
  );
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
