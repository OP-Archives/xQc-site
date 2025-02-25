import React, { useRef, useEffect, useState } from "react";
import { Button, Box, Alert, Paper } from "@mui/material";
import VideoJS from "./VideoJS";  // Make sure this import matches the default export
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
    poster: vod.thumbnail_url,
    sources: source ? [
      {
        src: typeof source === 'string' ? source : source.src,
        type: typeof source === 'string' ? 'application/x-mpegURL' : source.type,
        withCredentials: false
      }
    ] : [],
    html5: {
      vhs: {
        overrideNative: true,
        enableLowInitialPlaylist: true
      },
      nativeAudioTracks: false,
      nativeVideoTracks: false
    }
  };

  // Add new function to handle position saving
  const savePosition = (player) => {
    const currentTime = player.currentTime();
    localStorage.setItem(`video-position-${vod.id}`, currentTime);
  };

  const onReady = (player) => {
    if (!player) return;
    playerRef.current = player;

    // Restore last position after source is loaded
    player.one('loadedmetadata', () => {
      const savedPosition = localStorage.getItem(`video-position-${vod.id}`);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        if (!isNaN(position)) {
          player.currentTime(position);
        }
      }
    });

    // Save position periodically and on pause
    player.on('timeupdate', () => {
      // Save every 5 seconds
      if (Math.floor(player.currentTime()) % 5 === 0) {
        savePosition(player);
      }
    });

    player.on('pause', () => {
      savePosition(player);
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    player.on('ended', () => {
      localStorage.removeItem(`video-position-${vod.id}`);
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    // Set up hotkeys
    player.hotkeys({
      alwaysCaptureHotkeys: true,
      volumeStep: 0.1,
      seekStep: 5,
      enableModifiersForNumbers: false,
      enableMute: true,
      enableFullscreen: true,
    });

    // Initialize source if needed
    if (type === "cdn" && !source) {
      setSource(`${CDN_BASE}/videos/${vod.id}/${vod.id}.m3u8`);
    }

    // Set up event handlers
    player.on("play", () => {
      timeUpdate();
      loopTimeUpdate();
      setPlaying({ playing: true });
    });

    player.on("pause", () => {
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    player.on("ended", () => {
      clearTimeUpdate();
      setPlaying({ playing: false });
    });

    player.on("error", () => {
      const error = player.error();
      if (error && error.code === 4 && type === "cdn") {
        setSource(`${CDN_BASE}/videos/${vod.id}.mp4`);
      }
    });
  };

  const timeUpdate = () => {
    const player = playerRef.current;
    if (!player || !player.isReady_) return;
    
    try {
      if (player.paused()) return;
      let currentTime = player.currentTime();
      currentTime += delay;
      setCurrentTime(currentTime);
    } catch (error) {
      console.error('Error in timeUpdate:', error);
    }
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
    const player = playerRef.current;
    if (!player || !source) return;

    const currentSrc = player.currentSrc();
    const newSrc = typeof source === 'string' ? source : source.src;
    
    // Only update if source has actually changed
    if (currentSrc !== newSrc) {
      console.log('Updating source to:', newSrc);
      
      const sourceObject = {
        src: newSrc,
        type: typeof source === 'string' ? 'application/x-mpegURL' : source.type
      };

      player.src(sourceObject);

      // Handle timestamp after source change
      if (timestamp) {
        player.one('loadedmetadata', () => {
          player.currentTime(timestamp);
        });
      }

      // Update duration/delay after source change
      player.one('loadedmetadata', async () => {
        let playerDuration = player.duration();
        const vodDuration = toSeconds(vod.duration);
        const tmpDelay = vodDuration - playerDuration < 0 ? 0 : vodDuration - playerDuration;
        setDelay(tmpDelay);
      });
    }
  }, [source]); // Only depend on source changes

  // Add cleanup for localStorage
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
        <VideoJS options={videoJsOptions} onReady={onReady} vodId={vod.id} />
      </Box>
    </Box>
  );
}
