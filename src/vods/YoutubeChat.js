import React, { useEffect, useState, useRef, createRef, useCallback } from "react";
import { Box, Typography, Tooltip, Divider, Collapse, styled, IconButton } from "@mui/material";
import SimpleBar from "simplebar-react";
import Loading from "../utils/Loading";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collapseClasses } from "@mui/material/Collapse";

const GLOBAL_TWITCH_BADGES_API = "https://badges.twitch.tv/v1/badges/global/display?language=en";
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://cdn.frankerfacez.com/emote";
const BASE_BTTV_EMOTE_CDN = "https://bttv.xqc.wtf";
const BASE_7TV_EMOTE_CDN = "https://cdn.7tv.app/emote";
const API_BASE = "https://api.xqc.wtf";

let messageCount = 0;
let badgesCount = 0;

export default function Chat(props) {
  const { isMobile, vodId, playerRef, playing, userChatDelay, delay } = props;
  const [showChat, setShowChat] = useState(true);
  const [shownMessages, setShownMessages] = useState([]);
  const comments = useRef([]);
  const channelBadges = useRef();
  const globalTwitchBadges = useRef();
  const emotes = useRef();
  const cursor = useRef();
  const loopRef = useRef();
  const playRef = useRef();
  const chatRef = useRef();
  const stoppedAtIndex = useRef(0);
  const newMessages = useRef();

  useEffect(() => {
    const loadChannelBadges = () => {
      fetch(`${API_BASE}/v2/badges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) return;
          channelBadges.current = data;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadGlobalTwitchBadges = () => {
      fetch(GLOBAL_TWITCH_BADGES_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          globalTwitchBadges.current = data.badge_sets;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadEmotes = () => {
      fetch(`${API_BASE}/emotes?vod_id=${vodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) return;
          emotes.current = data.data[0];
        })
        .catch((e) => {
          console.error(e);
        });
    };

    loadEmotes();
    loadChannelBadges();
    loadGlobalTwitchBadges();
  }, [vodId]);

  const getCurrentTime = useCallback(() => {
    if (!playerRef.current) return 0;
    let time = 0;
    for (let video of props.youtube) {
      if (video.part >= props.part.part) break;
      time += video.duration;
    }
    time += playerRef.current.getCurrentTime();
    time += delay;
    time += userChatDelay;
    return time;
  }, [playerRef, props.youtube, delay, props.part.part, userChatDelay]);

  const buildComments = useCallback(() => {
    if (!playerRef.current || !comments.current || comments.current.length === 0 || !cursor.current || stoppedAtIndex.current === null) return;
    if (playerRef.current.getPlayerState() !== 1) return;

    const time = getCurrentTime();
    let lastIndex = comments.current.length - 1;
    for (let i = stoppedAtIndex.current.valueOf(); i < comments.current.length; i++) {
      if (comments.current[i].content_offset_seconds > time) {
        lastIndex = i;
        break;
      }
    }

    if (stoppedAtIndex.current === lastIndex && stoppedAtIndex.current !== 0) return;

    const fetchNextComments = () => {
      fetch(`${API_BASE}/v1/vods/${vodId}/comments?cursor=${cursor.current}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          stoppedAtIndex.current = 0;
          comments.current = response.comments;
          cursor.current = response.cursor;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const transformBadges = (badges) => {
      const badgeWrapper = [];

      for (const badge of badges) {
        let foundBadge = false;
        if (channelBadges.current) {
          for (let channelBadge of channelBadges.current) {
            if (badge._id !== channelBadge.set_id) continue;
            for (let badgeVersion of channelBadge.versions) {
              if (badgeVersion.id !== badge.version) continue;
              badgeWrapper.push(
                <img
                  key={badgesCount++}
                  crossOrigin="anonymous"
                  style={{ display: "inline-block", minWidth: "1rem", height: "1rem", margin: "0 .2rem .1rem 0", backgroundPosition: "50%", verticalAlign: "middle" }}
                  src={badgeVersion.image_url_1x}
                  alt=""
                />
              );
              foundBadge = true;
            }
          }
          if (foundBadge) continue;
        }

        if (!globalTwitchBadges.current) continue;
        const twitchBadge = globalTwitchBadges.current[badge._id];
        if (!twitchBadge) continue;
        badgeWrapper.push(
          <img
            key={badgesCount++}
            crossOrigin="anonymous"
            style={{ display: "inline-block", minWidth: "1rem", height: "1rem", margin: "0 .2rem .1rem 0", backgroundPosition: "50%", verticalAlign: "middle" }}
            src={`${BASE_TWITCH_CDN}/badges/v1/${twitchBadge.versions[badge.version] ? twitchBadge.versions[badge.version].image_url_1x : twitchBadge.versions[0].image_url_1x}`}
            alt=""
          />
        );
      }

      return <Box sx={{ display: "inline" }}>{badgeWrapper}</Box>;
    };

    const transformMessage = (message) => {
      if (!message) return;
      const textFragments = [];
      for (let i = 0; i < message.length; i++) {
        const fragment = message[i];
        if (!fragment.emoticon) {
          let textArray = fragment.text.split(" ");

          for (let text of textArray) {
            let found;
            if (emotes.current) {
              if (emotes.current.ffz_emotes) {
                for (let j = 0; j < emotes.current.ffz_emotes.length; j++) {
                  const emote = emotes.current.ffz_emotes[j];
                  if (text === emote.code) {
                    found = true;
                    textFragments.push(
                      <Box key={messageCount++} style={{ display: "inline" }}>
                        <img crossOrigin="anonymous" style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }} src={`${BASE_FFZ_EMOTE_CDN}/${emote.id}/1`} alt="" />
                        {` `}
                      </Box>
                    );
                    break;
                  }
                  if (found) continue;
                }
              }

              if (emotes.current.bttv_emotes) {
                for (let j = 0; j < emotes.current.bttv_emotes.length; j++) {
                  const emote = emotes.current.bttv_emotes[j];
                  if (text === emote.code) {
                    found = true;
                    textFragments.push(
                      <Box key={messageCount++} style={{ display: "inline" }}>
                        <img crossOrigin="anonymous" style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }} src={`${BASE_BTTV_EMOTE_CDN}/${emote.id}/1x`} alt="" />
                        {` `}
                      </Box>
                    );
                    break;
                  }
                }
                if (found) continue;
              }

              if (emotes.current["7tv_emotes"]) {
                for (let j = 0; j < emotes.current["7tv_emotes"].length; j++) {
                  const emote = emotes.current["7tv_emotes"][j];
                  if (text === emote.code) {
                    found = true;
                    textFragments.push(
                      <Box key={messageCount++} style={{ display: "inline" }}>
                        <img crossOrigin="anonymous" style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }} src={`${BASE_7TV_EMOTE_CDN}/${emote.id}/1x`} alt="" />
                        {` `}
                      </Box>
                    );
                    break;
                  }
                }
                if (found) continue;
              }
            }

            textFragments.push(<Typography variant="body1" display="inline" key={messageCount++}>{`${text} `}</Typography>);
          }
          continue;
        }
        textFragments.push(
          <Box key={i + fragment.emoticon.emoticon_id} sx={{ display: "inline" }}>
            <img
              crossOrigin="anonymous"
              style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }}
              src={`${BASE_TWITCH_CDN}/emoticons/v2/${fragment.emoticon.emoticon_id}/default/dark/1.0`}
              alt=""
            />
          </Box>
        );
      }
      return <Box sx={{ display: "inline" }}>{textFragments}</Box>;
    };

    const messages = [];
    for (let i = stoppedAtIndex.current.valueOf(); i < lastIndex; i++) {
      const comment = comments.current[i];
      if (!comment.message) continue;
      messages.push(
        <Box key={comment.id} ref={createRef()} sx={{ width: "100%" }}>
          <Box sx={{ alignItems: "flex-start", display: "flex", flexWrap: "nowrap", width: "100%", pl: 0.5, pt: 0.5, pr: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Box sx={{ display: "inline", pl: 1, pr: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {toHHMMSS(comment.content_offset_seconds)}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                {comment.user_badges && transformBadges(comment.user_badges)}
                <Box sx={{ textDecoration: "none", display: "inline" }}>
                  <span style={{ color: comment.user_color, fontWeight: 600 }}>{comment.display_name}</span>
                </Box>
                <Box sx={{ display: "inline" }}>
                  <span>: </span>
                  {transformMessage(comment.message)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    newMessages.current = messages;

    setShownMessages((shownMessages) => {
      const concatMessages = shownMessages.concat(messages);
      if (concatMessages.length > 200) concatMessages.splice(0, messages.length);

      return concatMessages;
    });
    stoppedAtIndex.current = lastIndex;
    if (comments.current.length - 1 === lastIndex) fetchNextComments();
  }, [getCurrentTime, playerRef, vodId]);

  const loop = useCallback(() => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
    buildComments();
    loopRef.current = setInterval(buildComments, 1000);
  }, [buildComments]);

  useEffect(() => {
    if (!playing.playing || stoppedAtIndex.current === undefined) return;
    const fetchComments = (offset = 0) => {
      fetch(`${API_BASE}/v1/vods/${vodId}/comments?content_offset_seconds=${offset}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          comments.current = response.comments;
          cursor.current = response.cursor;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const time = getCurrentTime();

    if (comments.current && comments.current.length > 0) {
      const lastComment = comments.current[comments.current.length - 1];
      const firstComment = comments.current[0];

      if (time - lastComment.content_offset_seconds <= 30 && time > firstComment.content_offset_seconds) {
        if (comments.current[stoppedAtIndex.current].content_offset_seconds - time >= 4) {
          stoppedAtIndex.current = 0;
          setShownMessages([]);
        }
        loop();
        return;
      }
    }
    if (playRef.current) clearTimeout(playRef.current);
    playRef.current = setTimeout(() => {
      stopLoop();
      stoppedAtIndex.current = 0;
      comments.current = [];
      cursor.current = null;
      setShownMessages([]);
      fetchComments(time);
      loop();
    }, 300);
    return () => {
      stopLoop();
    };
  }, [playing, vodId, getCurrentTime, loop]);

  const stopLoop = () => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
  };

  useEffect(() => {
    if (!chatRef.current || shownMessages.length === 0) return;
    /*
    if (chatRef.current.scrollHeight === chatRef.current.offsetHeight) return;

    let messageHeight = 0;
    for (let message of newMessages.current) {
      if (!message.ref.current) continue;
      messageHeight += message.ref.current.scrollHeight;
    }

    if (chatRef.current.scrollHeight - messageHeight <= chatRef.current.scrollTop + chatRef.current.offsetHeight + 300) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }*/

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [shownMessages]);

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  return (
    <Box sx={{ height: "100%", background: "#131314", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {showChat ? (
        <>
          <Box sx={{ display: "grid", alignItems: "center", p: 1 }}>
            {!isMobile && (
              <Box sx={{ justifySelf: "left", gridColumnStart: 1, gridRowStart: 1 }}>
                <Tooltip title="Collapse">
                  <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                    <ExpandMoreIcon />
                  </ExpandMore>
                </Tooltip>
              </Box>
            )}
            <Box sx={{ justifySelf: "center", gridColumnStart: 1, gridRowStart: 1 }}>
              <Typography variant="body1">Chat Replay</Typography>
            </Box>
          </Box>
          <Divider />
          <CustomCollapse in={showChat} timeout="auto" unmountOnExit sx={{ minWidth: "340px" }}>
            {comments.length === 0 ? (
              <Loading />
            ) : (
              <SimpleBar scrollableNodeProps={{ ref: chatRef }} style={{ height: "100%", overflowX: "hidden" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: 0, alignItems: "flex-end" }}>{shownMessages}</Box>
                </Box>
              </SimpleBar>
            )}
          </CustomCollapse>
        </>
      ) : (
        !isMobile && (
          <Box sx={{ position: "absolute", right: 0 }}>
            <Tooltip title="Expand">
              <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                <ExpandMoreIcon />
              </ExpandMore>
            </Tooltip>
          </Box>
        )
      )}
    </Box>
  );
}

const toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

const CustomCollapse = styled(({ _, ...props }) => <Collapse {...props} />)({
  [`& .${collapseClasses.wrapper}`]: {
    height: "100%",
  },
});

const ExpandMore = styled(React.forwardRef(({ expand, ...props }, ref) => <IconButton {...props} />))`
  margin-left: auto;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  ${(props) =>
    props.expand
      ? `
          transform: rotate(-90deg);
        `
      : `
          transform: rotate(90deg);
        `}
`;
