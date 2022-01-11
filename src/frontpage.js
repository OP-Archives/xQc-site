import React, { useEffect } from "react";
import SimpleBar from "simplebar-react";
import { Box, Typography, useMediaQuery, Link, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ErrorBoundary from "./utils/ErrorBoundary";
import AdSense from "react-adsense";
import Footer from "./utils/Footer";
import CustomLink from "./utils/CustomLink";

export default function Frontpage(props) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");
  const channel = props.channel;
  const [vodList, setVodList] = React.useState([]);
  const [vods, setVods] = React.useState([]);

  useEffect(() => {
    const fetchVods = async () => {
      await fetch(`https://archive.overpowered.tv/${channel}/vods?$limit=10&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          //don't display vods without a video link
          setVodList(
            data.data
              .filter((vod) => {
                return vod.youtube.length !== 0;
              })
              .slice(0, 3)
          );
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [classes, channel]);

  useEffect(() => {
    if (!vodList && vodList.length === 0) return;
    const changedVodList = isMobile ? vodList.slice(0, 2) : vodList.slice(0, 3);
    setVods(
      changedVodList.map((vod, i) => {
        return (
          <div key={vod.id} style={{ width: isMobile ? "10rem" : "18rem", maxWidth: isMobile ? "100%" : "30%" }} className={classes.paper}>
            <div className={classes.lower}>
              <div style={{ display: "flex", flexWrap: "nowrap" }}>
                <div
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    width: "100%",
                    order: 2,
                    minWidth: 0,
                  }}
                >
                  <div style={{ marginBottom: "0.1rem" }}>
                    <CustomLink className={classes.title2} href={`/${vod.youtube.some((youtube) => youtube.type === "live") ? "live" : "vods"}/${vod.id}`} variant="caption" color="textSecondary">
                      {vod.title}
                    </CustomLink>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.imageBox}>
              <Link href={`/${vod.youtube.some((youtube) => youtube.type === "live") ? "live" : "vods"}/${vod.id}`}>
                <img alt="" src={vod.thumbnail_url} className={classes.image2} />
              </Link>
              <div className={classes.corners}>
                <div className={classes.bottomLeft}>
                  <Typography variant="caption">{`${vod.date}`}</Typography>
                </div>
              </div>
              <div className={classes.corners}>
                <div className={classes.bottomRight}>
                  <Typography variant="caption">{`${vod.duration}`}</Typography>
                </div>
              </div>
            </div>
          </div>
        );
      })
    );
    return;
  }, [vodList, classes, isMobile]);

  return (
    <Box className={classes.root}>
      <SimpleBar style={{ height: "100%" }}>
        <div id="top-ad-banner" className={classes.topAdBanner}>
          <ErrorBoundary>
            {isMobile ? (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "300px",
                  height: "100px",
                }}
                format=""
              />
            ) : (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "728px",
                  height: "90px",
                }}
                format=""
              />
            )}
          </ErrorBoundary>
        </div>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mt: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: `${isMobile ? "100%" : "50%"}` }}>
            <Paper sx={{ padding: "1rem" }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mb: 2 }}>
                <CustomLink href="/vods">
                  <Typography variant="h6">Most Recent Vods</Typography>
                </CustomLink>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>{vods}</Box>
            </Paper>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mt: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: `${isMobile ? "100%" : "50%"}` }}>
            <Paper sx={{ padding: "1rem" }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mb: 1 }}>
                <CustomLink href="https://metathreads.com/collections/pokelawls" target="_blank" rel="noopener noreferrer">
                  <Typography variant="h6">Merch</Typography>
                </CustomLink>
              </Box>
              <Box display="flex" flexWrap="nowrap"></Box>
            </Paper>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mt: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: `${isMobile ? "100%" : "50%"}` }}>
            <iframe
              title="Player"
              width="100%"
              height="160"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/910917202&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
            />
          </Box>
        </Box>
        <Footer />
      </SimpleBar>
    </Box>
  );
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "calc(100% - 5rem)",
    overflow: "hidden",
    width: "100%",
    flexDirection: "column",
    flexGrow: 1,
  },
  image: {
    marginRight: "2rem",
    marginTop: "2rem",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  hover: {
    "&:hover": {
      boxShadow: "0 0 8px #43a047ff",
    },
  },
  paper: {
    flex: "0 0 auto",
    padding: "0 .5rem",
    display: "flex",
    flexDirection: "column",
  },
  title2: {
    color: "#fff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
  imageBox: {
    overflow: "hidden",
    height: 0,
    paddingTop: "56.25%",
    position: "relative",
    order: 1,
    "&:hover": {
      boxShadow: "0 0 8px #43a047ff",
    },
  },
  image2: {
    verticalAlign: "top",
    maxWidth: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  lower: {
    order: 2,
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  corners: {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    marginLeft: "5px",
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginRight: "5px",
  },
  topAdBanner: {
    textAlign: "center",
    marginBottom: "0px",
    marginTop: "30px",
    border: "0pt none",
  },
});
