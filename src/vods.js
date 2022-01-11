import React, { useEffect } from "react";
import { Box, Typography, useMediaQuery, Link, Container, Button, Menu, MenuItem, CircularProgress, Pagination } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SimpleBar from "simplebar-react";
import ListIcon from "@mui/icons-material/List";
import Logo from "./assets/jammin.gif";
import ErrorBoundary from "./ErrorBoundary.js";
import AdSense from "react-adsense";
import CustomLink from "./utils/CustomLink";
import Footer from "./utils/Footer";

const limit = 50;

export default function Vods(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const classes = useStyles();
  const [vods, setVods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [vodList, setVodList] = React.useState([]);
  const [page, setPage] = React.useState(null);
  const [totalPages, setTotalPages] = React.useState(null);
  const { channel } = props;

  useEffect(() => {
    document.title = `VODS - ${channel.charAt(0).toUpperCase() + channel.slice(1)}`;
    const fetchVods = async () => {
      await fetch(`https://archive.overpowered.tv/${channel}/vods?$limit=${limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          //don't display vods without a video link
          let vods = data.data.filter((vod) => {
            return vod.youtube.length !== 0;
          });

          setPage(1);
          setVodList(vods);
          setTotalPages(Math.floor(data.total / limit));
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [channel]);

  const IsolatedMenu = (props) => {
    const { vod } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    return (
      <React.Fragment>
        <Button className={classes.partButton} onClick={handleClick}>
          <ListIcon />
          Parts
        </Button>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          classes={{
            paper: classes.menuPaper,
          }}
          onClose={handleClose}
        >
          {vod.youtube.map((data, index) => {
            return (
              <CustomLink key={data.id} href={`/${data.type === "live" ? "live" : "vods"}/${props.vod.id}?part=${index + 1}`}>
                <MenuItem className={classes.item}>Part {index + 1}</MenuItem>
              </CustomLink>
            );
          })}
        </Menu>
      </React.Fragment>
    );
  };

  useEffect(() => {
    setVods(
      vodList.map((vod, i) => {
        const containsLiveVods = vod.youtube.some((data) => data.type === "live");
        vod.youtube = vod.youtube.filter((data) => (containsLiveVods ? data.type === "live" : data.type === "vod"));
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
                    <CustomLink className={classes.title} href={`/${containsLiveVods ? "live" : "vods"}/${vod.id}`} variant="caption" color="textSecondary">
                      {vod.title}
                    </CustomLink>
                  </div>
                </div>
              </div>
              {vod.youtube.length > 1 ? <IsolatedMenu vod={vod} /> : <></>}
            </div>
            <div className={classes.imageBox}>
              <Link href={`/${containsLiveVods ? "live" : "vods"}/${vod.id}`}>
                <img alt="" src={vod.thumbnail_url} className={classes.image} />
              </Link>
              <div className={classes.corners}>
                <div className={classes.bottomLeft}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.date}`}
                  </Typography>
                </div>
              </div>
              <div className={classes.corners}>
                <div className={classes.bottomRight}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.duration}`}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );
      })
    );
    setLoading(false);
    return;
  }, [vodList, classes, isMobile]);

  const handlePageChange = (e, value) => {
    if (page === value) return;
    setLoading(true);
    setPage(value);

    fetch(`https://archive.overpowered.tv/${channel}/vods?$limit=${limit}&$skip=${(value - 1) * limit}&$sort[createdAt]=-1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length === 0) {
          return;
        }
        //don't display vods without a video link
        let vods = data.data.filter((vod) => {
          return vod.youtube.length !== 0;
        });

        setVodList(vods);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return loading ? (
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
      <SimpleBar className={classes.scroll}>
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography variant="h4" color="primary">
            {`Vods`}
          </Typography>
        </Box>
        <div className={classes.root}>
          {vods}
          <div id="square-ad-banner" className={classes.squareAd}>
            <ErrorBoundary>
              <AdSense.Google
                client="ca-pub-8093490837210586"
                slot="7846377499"
                style={{
                  width: "300px",
                  height: "200px",
                }}
                format=""
              />
            </ErrorBoundary>
          </div>
        </div>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          {totalPages !== null && <Pagination count={totalPages} disabled={totalPages <= 1} color="primary" page={page} onChange={handlePageChange} />}
        </Box>
        <Footer />
      </SimpleBar>
    </Container>
  );
}

const useStyles = makeStyles(() => ({
  parent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  root: {
    marginTop: "2rem",
    display: "flex",
    flexWrap: "wrap",
    height: "100%",
    justifyContent: "center",
  },
  center: {
    textAlign: "center",
  },
  loadMore: {
    color: `#fff`,
    "&:hover": {
      opacity: "0.7",
    },
    whiteSpace: "nowrap",
    textTransform: "none",
  },
  header: {
    marginTop: "3rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  page: {
    marginTop: "2rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  paper: {
    flex: "0 0 auto",
    padding: "0 .5rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
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
  image: {
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
  scroll: {
    height: "calc(100% - 4rem)",
    position: "relative",
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
  cornerText: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.6)",
    padding: "0 .2rem",
  },
  partButton: {
    paddingRight: "1rem",
    marginTop: "0.3rem",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.6)",
    "&:hover": {
      opacity: "50%",
    },
  },
  menuPaper: {
    backgroundColor: "#0e0e10",
    color: "#fff",
  },
  item: {
    color: "#fff",
    "&:hover": {
      opacity: "50%",
      color: "#fff",
    },
  },
  topAdBanner: {
    textAlign: "center",
    marginBottom: "0px",
    marginTop: "30px",
    border: "0pt none",
  },
  squareAd: {
    textAlign: "center",
    marginBottom: "0px",
    marginTop: "15px",
  },
}));
