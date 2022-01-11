import React, { Component } from "react";
import { Box, Typography, useMediaQuery, Link, Container, Button, MenuItem, CircularProgress, FormControl, InputLabel, Select, FormGroup, Switch, FormControlLabel } from "@mui/material";
import { withStyles } from "@mui/styles";
import Youtube from "react-youtube";
import SimpleBar from "simplebar-react";
import canAutoPlay from "can-autoplay";
import Logo from "./assets/jammin.gif";
import { Resizable } from "re-resizable";
import { useLocation, useParams } from "react-router-dom";

/**
 * TODO:
 * DURATION QUERY PARAM
 */

function toSeconds(str) {
  var p = str.split(":"),
    s = 0,
    m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

class VodPlayer extends Component {
  constructor(props) {
    super(props);

    this.BADGES_TWITCH_URL = "https://badges.twitch.tv/v1/badges/global/display?language=en";
    this.BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
    this.BASE_FFZ_EMOTE_API = "https://api.frankerfacez.com/v1";
    this.BASE_BTTV_EMOTE_API = "https://api.betterttv.net/3";
    this.BASE_BTTV_CDN = "https://cdn.betterttv.net";
    this.BASE_7TV_EMOTE_API = "https://api.7tv.app/v2";
    this.vodId = props.vodId;
    this.twitchId = props.twitchId;
    this.player = null;
    this.chatRef = React.createRef();
    this.messageCount = 0;
    this.badgesCount = 0;
    this.channel = props.channel;
    this.durations = [];
    this.totalYoutubeDuration = 0;
    let part = new URLSearchParams(props.location.search).get("part");
    if (part && !isNaN(part) && part > 0) {
      part = part - 1;
    } else {
      part = 0;
    }
    this.state = {
      part: part,
      chatLoading: true,
      messages: [],
      stoppedAtIndex: 0,
      comments: [],
      type: props.type,
    };
  }

  async componentDidMount() {
    document.title = `${this.props.vodId} Vod - ${this.channel.charAt(0).toUpperCase() + this.channel.slice(1)}`;
    await this.fetchVodData();
    this.loadBadges();
    this.loadChannelBadges(this.twitchId);
    this.loadFFZEmotes(this.twitchId);
    this.loadBTTVGlobalEmotes(this.twitchId);
    this.loadBTTVChannelEmotes(this.twitchId);
    this.load7TVEmotes();
    this.totalYoutubeDuration = 0;
    for (let video of this.state.youtube_data) {
      this.totalYoutubeDuration += video.duration;
    }
    this.vodDuration = toSeconds(this.state.vodData.duration);
    this.delay = this.vodDuration - this.totalYoutubeDuration < 0 ? 0 : this.vodDuration - this.totalYoutubeDuration;
    console.info(`Chat Delay: ${this.delay} seconds`);
    let driveId;
    if (this.state.vodData.drive)
      for (let drive of this.state.vodData.drive) {
        if (this.state.type === drive.type) {
          driveId = drive.id;
          break;
        }
      }
    this.setState({ driveId: driveId });
    if (this.state.vodData.chapters[0].image) {
      this.gameBoxArt = this.state.vodData.chapters[0].image;
      this.gameBoxArt = this.gameBoxArt.replace("{width}", "40");
      this.gameBoxArt = this.gameBoxArt.replace("{height}", "53");
    }
  }

  componentWillUnmount() {
    this.clearLoopTimeout();
  }

  fetchVodData = async () => {
    await fetch(`https://archive.overpowered.tv/${this.channel}/vods/${this.vodId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          vodData: data,
          youtube_data: data.youtube.filter((data) => data.type === this.state.type),
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBTTVGlobalEmotes = () => {
    fetch(`${this.BASE_BTTV_EMOTE_API}/cached/emotes/global`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.BTTVGlobalEmotes = data;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBTTVChannelEmotes = (twitchId) => {
    fetch(`${this.BASE_BTTV_EMOTE_API}/cached/users/twitch/${twitchId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.BTTVEmotes = data.sharedEmotes.concat(data.channelEmotes);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadFFZEmotes = (twitchId) => {
    fetch(`${this.BASE_FFZ_EMOTE_API}/room/id/${twitchId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.FFZEmotes = data.sets[data.room.set].emoticons;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  load7TVEmotes = () => {
    fetch(`${this.BASE_7TV_EMOTE_API}/users/${this.channel}/emotes`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.SevenTVEmotes = data;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBadges = () => {
    fetch(this.BADGES_TWITCH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.badgeSets = data.badge_sets;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadChannelBadges = () => {
    fetch(`https://archive.overpowered.tv/${this.channel}/v2/badges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status >= 400) return;
        this.channelBadges = data;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  onReady = (evt) => {
    this.player = evt.target;
    if (this.state.youtube_data[this.state.part]) {
      this.player.loadVideoById(this.state.youtube_data[this.state.part].id);
    } else if (this.state.youtube_data[0]) {
      this.setState({ part: 0 }, () => {
        this.player.loadVideoById(this.state.youtube_data[this.state.part].id);
      });
    } else {
      return;
    }
    canAutoPlay.video().then(({ result }) => {
      if (!result) {
        evt.target.mute();
      }
    });
  };

  handleChange = (event) => {
    const part = event.target.value;
    this.clearLoopTimeout();
    if (this.state.youtube_data[part].id) {
      this.setState({ part: part });
      this.player.loadVideoById(this.state.youtube_data[part].id);
    }
  };

  onPlay = async (evt) => {
    if (this.playTimeout) clearTimeout(this.playTimeout);
    this.playTimeout = setTimeout(async () => {
      let offset = Math.round(this.player.getCurrentTime());
      for (let i = 0; i < this.state.part; i++) {
        offset += this.state.youtube_data[i].duration;
      }
      offset += this.delay;
      //SEEK
      if (this.state.comments.length > 0) {
        const lastComment = this.state.comments[this.state.comments.length - 1];
        const firstComment = this.state.comments[0];
        if (offset - lastComment.content_offset_seconds <= 30 && offset > firstComment.content_offset_seconds) {
          //IF: rewinded?
          if (this.state.comments[this.state.stoppedAtIndex].content_offset_seconds - offset >= 4) {
            this.setState(
              {
                stoppedAtIndex: 0,
                messages: [],
              },
              () => {
                this.loop();
              }
            );
            return;
          }
          this.loop();
          return;
        }
      }
      this.setState(
        {
          messages: [],
          comments: [],
          stoppedAtIndex: 0,
          chatLoading: true,
          cursor: null,
        },
        () => {
          this.fetchComments(offset);
          this.loop();
        }
      );
    }, 300);
  };

  onEnd = (evt) => {
    this.clearLoopTimeout();
    const nextPart = this.state.part + 1;
    if (this.state.youtube_data[nextPart]?.id) {
      this.setState({ part: nextPart });
      this.player.loadVideoById(this.state.youtube_data[nextPart].id);
    }
  };

  playerError = (evt) => {
    console.error(evt.data);
  };

  clearLoopTimeout = (evt) => {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
      return;
    }
  };

  fetchComments = async (offset) => {
    await fetch(`https://archive.overpowered.tv/${this.channel}/v1/vods/${this.vodId}/comments?content_offset_seconds=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          chatLoading: false,
          comments: data.comments,
          cursor: data.cursor,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  fetchNextComments = async () => {
    await fetch(`https://archive.overpowered.tv/${this.channel}/v1/vods/${this.vodId}/comments?cursor=${this.state.cursor}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          comments: this.state.comments.concat(data.comments),
          cursor: data.cursor,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  transformBadges = (badges) => {
    if (!badges) return null;
    let badgeWrapper = [];
    for (const badge of badges) {
      let foundBadge = false;
      if (this.channelBadges && this.channelBadges.length > 0) {
        for (let channelBadge of this.channelBadges) {
          if (badge._id !== channelBadge.set_id) continue;
          for (let badgeVersion of channelBadge.versions) {
            if (badgeVersion.id !== badge.version) continue;
            badgeWrapper.push(
              <img
                key={this.badgesCount++}
                crossOrigin="anonymous"
                className={this.props.classes.badges}
                src={badgeVersion.image_url_1x}
                srcSet={`${badgeVersion.image_url_1x} 1x, ${badgeVersion.image_url_2x} 2x, ${badgeVersion.image_url_4x} 4x`}
                alt=""
              />
            );
            foundBadge = true;
          }
        }
        if (foundBadge) continue;
      }

      const twitchBadge = this.badgeSets[badge._id];
      if (twitchBadge) {
        badgeWrapper.push(
          <img
            key={this.badgesCount++}
            crossOrigin="anonymous"
            className={this.props.classes.badges}
            src={`${this.BASE_TWITCH_CDN}/badges/v1/${twitchBadge.versions[badge.version] ? twitchBadge.versions[badge.version].image_url_1x : twitchBadge.versions[0].image_url_1x}`}
            srcSet={`${this.BASE_TWITCH_CDN}/badges/v1/${twitchBadge.versions[badge.version] ? twitchBadge.versions[badge.version].image_url_1x : twitchBadge.versions[0].image_url_1x} 1x, ${
              this.BASE_TWITCH_CDN
            }/badges/v1/${twitchBadge.versions[badge.version] ? twitchBadge.versions[badge.version].image_url_2x : twitchBadge.versions[0].image_url_2x} 2x, ${this.BASE_TWITCH_CDN}/badges/v1/${
              twitchBadge.versions[badge.version] ? twitchBadge.versions[badge.version].image_url_4x : twitchBadge.versions[0].image_url_4x
            } 4x`}
            alt=""
          />
        );
      }
    }

    return <span>{badgeWrapper}</span>;
  };

  transformMessage = (messageFragments) => {
    if (messageFragments === null) return;
    const textFragments = [];
    for (let messageFragment of messageFragments) {
      if (!messageFragment.emoticon) {
        let messageArray = messageFragment.text.split(" ");
        for (let message of messageArray) {
          let found;
          if (this.FFZEmotes) {
            for (let ffz_emote of this.FFZEmotes) {
              if (message === ffz_emote.name) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      className={this.props.classes.chatEmote}
                      src={`https:${ffz_emote.urls["1"]}`}
                      srcSet={`https:${ffz_emote.urls["1"]} 1x, https:${ffz_emote.urls["2"]} 2x, https:${ffz_emote.urls["4"]} 4x`}
                      alt=""
                    />
                    {` `}
                  </div>
                );
                break;
              }
            }
            if (found) continue;
          }

          if (this.BTTVGlobalEmotes) {
            for (let bttv_emote of this.BTTVGlobalEmotes) {
              if (message === bttv_emote.code) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      className={this.props.classes.chatEmote}
                      src={`${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/1x`}
                      srcSet={`${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/1x 1x, ${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/2x 2x, ${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/3x 4x`}
                      alt=""
                    />
                    {` `}
                  </div>
                );
                break;
              }
            }
            if (found) continue;
          }

          if (this.BTTVEmotes) {
            for (let bttv_emote of this.BTTVEmotes) {
              if (message === bttv_emote.code) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      className={this.props.classes.chatEmote}
                      src={`${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/1x`}
                      srcSet={`${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/1x 1x, ${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/2x 2x, ${this.BASE_BTTV_CDN}/emote/${bttv_emote.id}/3x 4x`}
                      alt=""
                    />
                    {` `}
                  </div>
                );
                break;
              }
            }
            if (found) continue;
          }

          if (this.SevenTVEmotes) {
            for (let sevenTVEmote of this.SevenTVEmotes) {
              if (message === sevenTVEmote.name) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      className={this.props.classes.chatEmote}
                      src={`${sevenTVEmote.urls[0][1]}`}
                      srcSet={`${sevenTVEmote.urls[0][1]} 1x, ${sevenTVEmote.urls[1][1]} 2x, ${sevenTVEmote.urls[2][1]} 3x, ${sevenTVEmote.urls[3][1]} 4x`}
                      alt=""
                    />
                    {` `}
                  </div>
                );
                break;
              }
            }
            if (found) continue;
          }

          textFragments.push(<span key={this.messageCount++}>{`${message} `}</span>);
        }
      } else {
        textFragments.push(
          <div key={this.messageCount++} style={{ display: "inline" }}>
            <img
              crossOrigin="anonymous"
              className={this.props.classes.chatEmote}
              src={`${this.BASE_TWITCH_CDN}/emoticons/v2/${messageFragment.emoticon.emoticon_id}/default/dark/1.0`}
              srcSet={
                messageFragment.emoticon.emoticon_set_id
                  ? `${this.BASE_TWITCH_CDN}/emoticons/v2/${messageFragment.emoticon.emoticon_set_id}/default/dark/1.0 1x, ${this.BASE_TWITCH_CDN}/emoticons/v2/${messageFragment.emoticon.emoticon_set_id}/default/dark/2.0 2x`
                  : ""
              }
              alt=""
            />
          </div>
        );
      }
    }
    return <span className="messages">{textFragments}</span>;
  };

  buildMessages = async () => {
    if (!this.player || !this.state.comments) return;
    const playerState = this.player.getPlayerState();
    if (this.state.comments.length === 0 || playerState !== 1) return;

    let playerCurrentTime = Math.round(this.player.getCurrentTime());
    for (let i = 0; i < this.state.part; i++) {
      playerCurrentTime += this.state.youtube_data[i].duration;
    }
    playerCurrentTime += this.delay;

    let pastIndex = this.state.comments.length - 1;
    for (let i = this.state.stoppedAtIndex.valueOf(); i < this.state.comments.length; i++) {
      const comment = this.state.comments[i];
      if (comment.content_offset_seconds > playerCurrentTime) {
        pastIndex = i;
        break;
      }
    }

    if (this.state.comments.length - 1 === pastIndex) {
      await this.fetchNextComments();
    }
    if (this.state.stoppedAtIndex === pastIndex && this.state.stoppedAtIndex !== 0) return;

    let messages = this.state.messages.slice(0);
    for (let i = this.state.stoppedAtIndex.valueOf(); i < pastIndex; i++) {
      const comment = this.state.comments[i];
      if (!comment.message) continue;
      messages.push(
        <li key={comment.id} style={{ width: "100%" }}>
          <Box alignItems="flex-start" display="flex" flexWrap="nowrap" width="100%" paddingLeft="0.5rem" paddingTop="0.5rem" paddingBottom="0.5rem">
            <Box width="100%">
              <Box alignItems="flex-start" display="flex" flexWrap="nowrap" color="#fff">
                <Box flexGrow={1}>
                  {this.transformBadges(comment.user_badges)}
                  <div
                    style={{
                      color: "#615b5b",
                      textDecoration: "none",
                      display: "inline",
                    }}
                  >
                    <span style={{ color: comment.user_color, fontWeight: "700" }}>{comment.display_name}</span>
                  </div>
                  <Box display="inline">
                    <span>: </span>
                    {this.transformMessage(comment.message)}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </li>
      );
      if (messages.length > 75) messages.splice(0, 1);
    }

    this.setState(
      {
        messages: messages,
        stoppedAtIndex: pastIndex,
      },
      () => {
        if (!this.chatRef.current) return;
        this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight;
      }
    );
  };

  loop = () => {
    if (this.loopTimeout) clearTimeout(this.loopTimeout);
    this.loopTimeout = setTimeout(async () => {
      await this.buildMessages();
      this.loop();
    }, 1000);
  };

  changeTypeHandler = () => {
    this.clearLoopTimeout();
    this.setState({ type: this.state.type === "live" ? "vod" : "live" }, async () => {
      await this.fetchVodData();
      this.totalYoutubeDuration = 0;
      for (let video of this.state.youtube_data) {
        this.totalYoutubeDuration += video.duration;
      }
      this.delay = this.vodDuration - this.totalYoutubeDuration < 0 ? 0 : this.vodDuration - this.totalYoutubeDuration;
      console.info(`Chat Delay: ${this.delay} seconds`);
      let driveId;
      if (this.state.vodData.drive)
        for (let drive of this.state.vodData.drive) {
          if (this.state.type === drive.type) {
            driveId = drive.id;
            break;
          }
        }
      this.setState({ driveId: driveId });
      if (this.state.youtube_data[this.state.part].id) {
        this.player.loadVideoById(this.state.youtube_data[this.state.part].id);
      }
    });
  };

  render() {
    const { classes, isMobile } = this.props;
    const { vodData, chatLoading, messages, driveId, part, youtube_data, type } = this.state;

    return !vodData ? (
      <div className={classes.parent}>
        <div style={{ textAlign: "center" }}>
          <div>
            <img alt="" src={Logo} height="auto" width="75%" />
          </div>
          <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
        </div>
      </div>
    ) : (
      <Container maxWidth={false} disableGutters style={{ height: "100%" }}>
        <Box flexDirection={isMobile ? "column" : "row"} className={classes.playerParent}>
          <div style={{ width: "100%" }}>
            <Youtube
              containerClassName={classes.player}
              id="player"
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
              onReady={this.onReady}
              onPlay={this.onPlay}
              onPause={this.clearLoopTimeout}
              onEnd={this.onEnd}
              onError={this.playerError}
            />
            <Box display="flex" flexGrow="1">
              <div className={classes.container}>
                <div className={classes.row}>
                  <Box display="flex" alignItems="center">
                    <div className={classes.marginRight}>
                      <img alt="" src={this.gameBoxArt} />
                    </div>
                    <Typography variant="body2" className={classes.title}>
                      {vodData.title}
                    </Typography>
                    <div className={`${classes.marginRight} ${classes.marginLeft}`}>
                      <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel className={classes.label} id="select-label">
                          Part
                        </InputLabel>
                        <Select labelId="select-label" value={part} onChange={this.handleChange} autoWidth>
                          {youtube_data.map((data, i) => {
                            return (
                              <MenuItem key={data.id} value={i}>
                                {i + 1}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </div>
                    <FormGroup>
                      <FormControlLabel
                        control={<Switch checked={type === "live"} onChange={this.changeTypeHandler} disabled={!vodData.youtube.some((data) => data.type === (type === "live" ? "vod" : "live"))} />}
                        label="Live Vod"
                      />
                    </FormGroup>
                    {!isMobile && (
                      <div className={`${classes.marginRight}`}>
                        {driveId != null && (
                          <Button component={Link} href={`https://drive.google.com/u/2/uc?id=${driveId}`} rel="noopener noreferrer" target="_blank" variant="contained">
                            Download Vod
                          </Button>
                        )}
                      </div>
                    )}
                  </Box>
                </div>
              </div>
            </Box>
          </div>
          <div className={classes.chatContainer}>
            <Resizable
              defaultSize={
                isMobile
                  ? {
                      height: "600px",
                      width: "100%",
                    }
                  : {
                      width: "340px",
                      height: "100%",
                    }
              }
              maxHeight={isMobile ? "600px" : "100%"}
              minHeight={isMobile ? "100px" : "100%"}
              minWidth={isMobile ? "100%" : "340px"}
              enable={
                isMobile
                  ? {
                      top: true,
                      right: false,
                      bottom: false,
                      left: false,
                      topRight: false,
                      bottomRight: false,
                      bottomLeft: false,
                      topLeft: false,
                    }
                  : {
                      top: false,
                      right: false,
                      bottom: false,
                      left: true,
                      topRight: false,
                      bottomRight: false,
                      bottomLeft: false,
                      topLeft: false,
                    }
              }
            >
              {chatLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <CircularProgress size="3rem" />
                </Box>
              ) : (
                <div className={classes.chat}>
                  <SimpleBar scrollableNodeProps={{ ref: this.chatRef }} className={classes.scroll}>
                    <Box display="flex" height="100%" justifyContent="flex-end" flexDirection="column">
                      <ul className={classes.ul}>{messages}</ul>
                    </Box>
                  </SimpleBar>
                </div>
              )}
            </Resizable>
          </div>
        </Box>
      </Container>
    );
  }
}

const useStyles = () => ({
  parent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  playerParent: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
  player: {
    height: "calc(100% - 6rem)",
    width: "100%",
  },
  text: {
    marginTop: "1rem",
    color: "#fff",
  },
  chatContainer: {
    backgroundColor: "#0e0e10",
  },
  chat: {
    height: "100%",
    width: "100%",
    backgroundColor: "#0e0e10",
    fontSize: "1rem",
    fontFamily: "helvetica neue,Helvetica,Arial,sans-serif",
    flex: "1 1 auto",
    lineHeight: "1rem",
    marginRight: ".2rem",
    overflowX: "hidden",
    overflowY: "auto",
  },
  scroll: {
    height: "100%",
  },
  ul: {
    minHeight: "0px",
    width: "calc(100% - 10px)",
    display: "flex",
    alignItems: "flex-end",
    flexWrap: "wrap",
    listStyle: "none",
  },
  badges: {
    display: "inline-block",
    minWidth: "1rem",
    height: "1rem",
    margin: "0 .2rem .1rem 0",
    backgroundPosition: "50%",
    verticalAlign: "middle",
  },
  chatEmote: {
    verticalAlign: "middle",
    border: "none",
    maxWidth: "100%",
  },
  row: {
    padding: "1rem",
  },
  form: {
    flexGrow: 1,
    position: "relative",
  },
  container: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid hsla(0,0%,100%,.1)",
    borderRight: "1px solid hsla(0,0%,100%,.1)",
    borderTop: "1px solid hsla(0,0%,100%,.1)",
    borderBottom: "1px solid hsla(0,0%,100%,.1)",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    width: "100%",
  },
  marginRight: {
    marginRight: "1rem",
  },
  marginLeft: {
    marginLeft: "1rem",
  },
  button: {
    backgroundColor: "#008230",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "#008230",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
  },
  formControl: {
    margin: "1rem",
    minWidth: 120,
  },
  label: {
    color: "#fff",
    "&.Mui-focused": {
      color: "#fff",
    },
  },
  dropdownStyle: {
    color: "#fff",
    backgroundColor: "#1d1d1d",
  },
  dropdownRoot: {
    color: "#fff",
  },
  dropdownSelect: {
    "&:before": {
      borderColor: "#fff",
    },
    "&:after": {
      borderColor: "#fff",
    },
  },
  dropdownIcon: {
    fill: "#fff",
  },
  title: {
    color: "#fff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
});

const withRouter = (WrappedComponent) => (props) => {
  const params = useParams();
  const location = useLocation();
  return <WrappedComponent {...props} vodId={params.vodId} location={location} />;
};

const withMediaQuery =
  (...args) =>
  (Component) =>
  (props) => {
    const mediaQuery = useMediaQuery(...args);
    return <Component isMobile={mediaQuery} {...props} />;
  };

  export default withStyles(useStyles)(withMediaQuery("(max-width: 600px)")(withRouter(VodPlayer)));
