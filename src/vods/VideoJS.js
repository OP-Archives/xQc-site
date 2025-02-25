import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Remove the named export and use default export directly
const VideoJS = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady } = props;

  // Initialize player once
  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const videoElement = videoRef.current;
    const player = videojs(videoElement, {
      ...options,
      controls: true,
      fluid: true,
      preload: 'auto',
      playsinline: true,
      muted: true,
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      }
    });

    playerRef.current = player;

    player.ready(() => {
      console.log('Player is ready');
      if (onReady) {
        onReady(player);
      }
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []); // Empty dependency array - only initialize once

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      />
    </div>
  );
};

// Change to default export only
export default VideoJS;