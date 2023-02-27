import React, { useEffect, useState, useRef, createRef, useCallback } from "react";
import { Box, Typography, Tooltip, Divider, Collapse, styled, IconButton, Button } from "@mui/material";
import SimpleBar from "simplebar-react";
import Loading from "../utils/Loading";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collapseClasses } from "@mui/material/Collapse";
import Twemoji from "react-twemoji";
import Settings from "./Settings";
import { toHHMMSS } from "../utils/helpers";
import SettingsIcon from "@mui/icons-material/Settings";

const GLOBAL_TWITCH_BADGES_API = "https://badges.twitch.tv/v1/badges/global/display?language=en";
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://cdn.frankerfacez.com/emote";
const BASE_BTTV_EMOTE_CDN = "https://bttv.xqc.wtf";
const BASE_7TV_EMOTE_CDN = "https://cdn.7tv.app/emote";
const API_BASE = process.env.REACT_APP_VODS_API_BASE;

let messageCount = 0;
let badgesCount = 0;

export default function Chat(props) {
  const { isPortrait, vodId, playerRef, playing, userChatDelay, delay, youtube, part, games } = props;
  const [showChat, setShowChat] = useState(true);
  const [shownMessages, setShownMessages] = useState([]);
  const comments = useRef([]);
  const channelBadges = useRef();
  const globalTwitchBadges = useRef();
  const emotes = useRef({ ffz_emotes: [], bttv_emotes: [], "7tv_emotes": [] });
  const cursor = useRef();
  const loopRef = useRef();
  const playRef = useRef();
  const chatRef = useRef();
  const stoppedAtIndex = useRef(0);
  const newMessages = useRef();
  const [scrolling, setScrolling] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (chatRef && chatRef.current) {
      const ref = chatRef.current;
      const handleScroll = (e) => {
        e.stopPropagation();
        const atBottom = ref.scrollHeight - ref.clientHeight - ref.scrollTop < 256;
        setScrolling(!atBottom);
      };

      ref.addEventListener("scroll", handleScroll);

      return () => ref.removeEventListener("scroll", handleScroll);
    }
  });

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
    if (youtube) {
      for (let video of youtube) {
        if (!video.part) break;
        if (video.part >= part.part) break;
        time += video.duration;
      }
      time += playerRef.current.getCurrentTime();
    } else if (games) {
      time += parseFloat(games[part.part - 1].start_time);
      time += playerRef.current.getCurrentTime();
    } else {
      time += playerRef.current.currentTime();
    }
    time += delay;
    time += userChatDelay;
    return time;
  }, [playerRef, youtube, delay, part, userChatDelay, games]);

  const buildComments = useCallback(() => {
    if (!playerRef.current || !comments.current || comments.current.length === 0 || !cursor.current || stoppedAtIndex.current === null) return;
    if (youtube || games ? playerRef.current.getPlayerState() !== 1 : playerRef.current.paused()) return;

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

      for (const textBadge of badges) {
        const badgeId = textBadge._id ?? textBadge.setID;
        const version = textBadge.version;

        if (channelBadges.current) {
          const badge = channelBadges.current.find((channelBadge) => channelBadge.set_id === badgeId);
          if (badge) {
            const badgeVersion = badge.versions.find((badgeVersion) => badgeVersion.id === version);
            if (badgeVersion) {
              badgeWrapper.push(
                <img
                  key={badgesCount++}
                  crossOrigin="anonymous"
                  style={{ display: "inline-block", minWidth: "1rem", height: "1rem", margin: "0 .2rem .1rem 0", backgroundPosition: "50%", verticalAlign: "middle" }}
                  srcSet={`${badgeVersion.image_url_1x} 1x, ${badgeVersion.image_url_2x} 2x, ${badgeVersion.image_url_4x} 4x`}
                  src={badgeVersion.image_url_1x}
                  alt=""
                />
              );
              continue;
            }
          }
        }

        if (globalTwitchBadges.current) {
          const twitchBadge = globalTwitchBadges.current[badgeId];
          if (twitchBadge) {
            badgeWrapper.push(
              <img
                key={badgesCount++}
                crossOrigin="anonymous"
                style={{ display: "inline-block", minWidth: "1rem", height: "1rem", margin: "0 .2rem .1rem 0", backgroundPosition: "50%", verticalAlign: "middle" }}
                srcSet={`${twitchBadge.versions[version].image_url_1x} 1x, ${twitchBadge.versions[version].image_url_2x} 2x, ${twitchBadge.versions[version].image_url_4x} 4x`}
                src={twitchBadge.image1x}
                alt=""
              />
            );
            continue;
          }
        }
      }

      return <Box sx={{ display: "inline" }}>{badgeWrapper}</Box>;
    };

    const transformMessage = (fragments) => {
      if (!fragments) return;

      const textFragments = [];
      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        if (fragment.emote) {
          textFragments.push(
            <Box key={i + fragment.emote.emoteID} sx={{ display: "inline" }}>
              <img
                crossOrigin="anonymous"
                style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }}
                src={`${BASE_TWITCH_CDN}/emoticons/v2/${fragment.emote.emoteID}/default/dark/1.0`}
                alt=""
              />
            </Box>
          );
          continue;
        }

        if (fragment.emoticon) {
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
          continue;
        }

        let textArray = fragment.text.split(" ");

        for (let text of textArray) {
          if (emotes.current) {
            const SEVENTV_EMOTES = emotes.current["7tv_emotes"];
            const BTTV_EMOTES = emotes.current["bttv_emotes"];
            const FFZ_EMOTES = emotes.current["ffz_emotes"];

            if (SEVENTV_EMOTES) {
              const emote = SEVENTV_EMOTES.find((SEVENTV_EMOTE) => SEVENTV_EMOTE.name === text || SEVENTV_EMOTE.code === text);
              if (emote) {
                textFragments.push(
                  <Box key={messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }}
                      src={`${BASE_7TV_EMOTE_CDN}/${emote.id}/1x`}
                      srcSet={`${BASE_7TV_EMOTE_CDN}/${emote.id}/1x 1x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/2x 2x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/4x 4x`}
                      alt=""
                    />{" "}
                  </Box>
                );
                continue;
              }
            }

            if (FFZ_EMOTES) {
              const emote = FFZ_EMOTES.find((FFZ_EMOTE) => FFZ_EMOTE.name === text || FFZ_EMOTE.code === text);
              if (emote) {
                textFragments.push(
                  <Box key={messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }}
                      src={`${BASE_FFZ_EMOTE_CDN}/${emote.id}/1`}
                      srcSet={`${BASE_FFZ_EMOTE_CDN}/${emote.id}/1 1x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/2 2x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/4 4x`}
                      alt=""
                    />{" "}
                  </Box>
                );
                continue;
              }
            }

            if (BTTV_EMOTES) {
              const emote = BTTV_EMOTES.find((BTTV_EMOTE) => BTTV_EMOTE.name === text || BTTV_EMOTE.code === text);
              if (emote) {
                textFragments.push(
                  <Box key={messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      style={{ verticalAlign: "middle", border: "none", maxWidth: "100%" }}
                      src={`${BASE_BTTV_EMOTE_CDN}/${emote.id}/1x`}
                      srcSet={`${BASE_BTTV_EMOTE_CDN}/${emote.id}/1x 1x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/2x 2x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/4x 4x`}
                      alt=""
                    />{" "}
                  </Box>
                );
                continue;
              }
            }
          }

          textFragments.push(
            <Twemoji key={messageCount++} noWrapper options={{ className: "twemoji" }}>
              <Typography variant="body1" display="inline">{`${text} `}</Typography>
            </Twemoji>
          );
        }
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
              {showTimestamp && (
                <Box sx={{ display: "inline", pl: 1, pr: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {toHHMMSS(comment.content_offset_seconds)}
                  </Typography>
                </Box>
              )}
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
  }, [getCurrentTime, playerRef, vodId, youtube, games, showTimestamp]);

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

    let messageHeight = 0;
    for (let message of newMessages.current) {
      if (!message.ref.current) continue;
      messageHeight += message.ref.current.scrollHeight;
    }
    const height = chatRef.current.scrollHeight - chatRef.current.clientHeight - chatRef.current.scrollTop - messageHeight;
    const atBottom = height < 256;
    if (atBottom) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [shownMessages]);

  const scrollToBottom = () => {
    setScrolling(false);
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  const handleExpandClick = () => {
    setShowChat(!showChat);
  };

  return (
    <Box sx={{ height: "100%", background: "#131314", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {showChat ? (
        <>
          <Box sx={{ display: "grid", alignItems: "center", p: 1 }}>
            {!isPortrait && (
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
            <Box sx={{ justifySelf: "end", gridColumnStart: 1, gridRowStart: 1 }}>
              <IconButton title="Settings" onClick={() => setShowModal(true)} color="primary">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />
          <CustomCollapse in={showChat} timeout="auto" unmountOnExit sx={{ minWidth: "340px" }}>
            {comments.length === 0 ? (
              <Loading />
            ) : (
              <>
                <SimpleBar scrollableNodeProps={{ ref: chatRef }} style={{ height: "100%", overflowX: "hidden" }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: 0, alignItems: "flex-end" }}>{shownMessages}</Box>
                  </Box>
                </SimpleBar>
                {scrolling && (
                  <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <Box sx={{ background: "rgba(0,0,0,.6)", minHeight: 0, borderRadius: 1, mb: 1, bottom: 0, position: "absolute" }}>
                      <Button size="small" onClick={scrollToBottom}>
                        Chat Paused
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CustomCollapse>
        </>
      ) : (
        !isPortrait && (
          <Box sx={{ position: "absolute", right: 0 }}>
            <Tooltip title="Expand">
              <ExpandMore expand={showChat} onClick={handleExpandClick} aria-expanded={showChat}>
                <ExpandMoreIcon />
              </ExpandMore>
            </Tooltip>
          </Box>
        )
      )}
      <Settings
        userChatDelay={userChatDelay}
        setUserChatDelay={props.setUserChatDelay}
        showModal={showModal}
        setShowModal={setShowModal}
        showTimestamp={showTimestamp}
        setShowTimestamp={setShowTimestamp}
      />
    </Box>
  );
}

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
