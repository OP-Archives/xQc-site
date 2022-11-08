import React, { useEffect } from "react";
import canAutoPlay from "can-autoplay";
import Youtube from "react-youtube";

export default function YoutubeGames(props) {
  const { games, playerRef, part, setPart, setPlaying } = props;

  useEffect(() => {
    if (!playerRef.current) return;

    playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
  }, [part, playerRef, games]);

  const onReady = (evt) => {
    playerRef.current = evt.target;

    canAutoPlay.video().then(({ result }) => {
      if (!result) playerRef.current.mute();
    });

    playerRef.current.loadVideoById(games[part.part - 1].video_id, part.timestamp);
  };

  const onPlay = () => {
    setPlaying({ playing: true });
  };

  const onPause = () => {
    setPlaying({ playing: false });
  };

  const onEnd = () => {
    const nextPart = part.part + 1;
    if (nextPart > games.length) return;
    setPart({ part: nextPart, duration: 0 });
  };

  const onError = (evt) => {
    if (evt.data !== 150) console.error(evt.data);
    //dmca error
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
