import React, { useEffect, useRef } from "react";
import canAutoPlay from "can-autoplay";
import Youtube from "react-youtube";

export default function YoutubePlayer(props) {
  const { youtube, playerRef, part, setPart, setCurrentTime, delay, setPlaying } = props;
  const timeUpdateRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const index = youtube.findIndex((data) => data.part === part.part);
    if (index !== -1) playerRef.current.loadVideoById(youtube[index].id, part.duration);
  }, [part, playerRef, youtube]);

  const timeUpdate = () => {
    if (!playerRef.current) return;
    if (playerRef.current.getPlayerState() !== 1) return;
    let currentTime = 0;
    for (let video of youtube) {
      if (video.part >= part.part) break;
      currentTime += video.duration;
    }
    currentTime += playerRef.current.getCurrentTime();
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

  const onReady = (evt) => {
    playerRef.current = evt.target;

    canAutoPlay.video().then(({ result }) => {
      if (!result) playerRef.current.mute();
    });

    const index = youtube.findIndex((data) => data.part === part.part);
    if (index !== -1) playerRef.current.loadVideoById(youtube[index].id, part.duration);
  };

  const onPlay = () => {
    timeUpdate();
    loopTimeUpdate();
    setPlaying({ playing: true });
  };

  const onPause = () => {
    clearTimeUpdate();
    setPlaying({ playing: false });
  };

  const onEnd = () => {
    setPart({ part: part.part + 1, duration: 0 });
  };

  const onError = (evt) => {
    if (evt.data !== 150) console.error(evt.data);
    //dmca error
  };

  const clearTimeUpdate = () => {
    if (timeUpdateRef.current !== null) clearTimeout(timeUpdateRef.current);
  };

  return (
    <Youtube
      className="youtube-player"
      opts={{
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
      }}
      onReady={onReady}
      onPlay={onPlay}
      onPause={onPause}
      onEnd={onEnd}
      onError={onError}
    />
  );
}
