import React, { useEffect } from "react";
import { Box, Typography, Button, MenuItem, Pagination, Grid, Tooltip, Paper, styled, Modal, useMediaQuery } from "@mui/material";
import SimpleBar from "simplebar-react";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import CustomLink from "../utils/CustomLink";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import default_thumbnail from "../assets/default_thumbnail.png";
import { tooltipClasses } from "@mui/material/Tooltip";
import YouTubeIcon from "@mui/icons-material/YouTube";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";

const limit = 50;
const API_BASE = "https://api.xqc.wtf";

export default function Vods() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [vods, setVods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(null);
  const [totalPages, setTotalPages] = React.useState(null);

  useEffect(() => {
    document.title = `VODS - xQc`;
    const fetchVods = async () => {
      await fetch(`${API_BASE}/vods?$limit=${limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setPage(1);
          setVods(response.data);
          setTotalPages(Math.floor(response.total / limit));
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, []);

  const handlePageChange = (e, value) => {
    if (page === value) return;
    setLoading(true);
    setPage(value);

    fetch(`${API_BASE}/vods?$limit=${limit}&$skip=${(value - 1) * limit}&$sort[createdAt]=-1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.data.length === 0) return;
        setVods(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (loading) return <Loading />;

  return (
    <SimpleBar style={{ maxHeight: "calc(100% - 5rem)" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, i) => (
            <Vod key={vod.id} vod={vod} isMobile={isMobile} />
          ))}
        </Grid>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        {totalPages !== null && <Pagination count={totalPages} disabled={totalPages <= 1} color="primary" page={page} onChange={handlePageChange} />}
      </Box>
      <Footer />
    </SimpleBar>
  );
}

const Vod = (props) => {
  const { vod, isMobile } = props;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Grid item xs={2} sx={{ maxWidth: "18rem", flexBasis: "18rem" }}>
        <Box
          sx={{
            overflow: "hidden",
            height: 0,
            paddingTop: "56.25%",
            position: "relative",
            "&:hover": {
              boxShadow: "0 0 8px #fff",
            },
          }}
        >
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <Button onClick={handleOpen} sx={{ height: "100%", width: "100%" }}>
              <img className="thumbnail" alt="" src={vod.thumbnail_url ? vod.thumbnail_url : default_thumbnail} />
            </Button>
          </Box>
          <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <Box sx={{ position: "absolute", bottom: 0, left: 0 }}>
              <Typography variant="caption" sx={{ padding: "0 .2rem", backgroundColor: "rgba(0,0,0,.6)" }}>
                {`${vod.date}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
              <Typography variant="caption" sx={{ padding: "0 .2rem", backgroundColor: "rgba(0,0,0,.6)" }}>
                {`${vod.duration}`}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 1, mb: 1 }}>
          <Box sx={{ display: "flex", flexWrap: "nowrap", flexDirection: "column" }}>
            <Box sx={{ flexGrow: 1, flexShrink: 1, width: "100%", minWidth: 0 }}>
              <Box>
                <CustomWidthTooltip title={vod.title} placement="bottom">
                  <span>
                    <Button onClick={handleOpen} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", width: "100%" }}>
                      <Typography variant="caption" color="primary">
                        {vod.title}
                      </Typography>
                    </Button>
                  </span>
                </CustomWidthTooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Modal keepMounted open={open} onClose={handleClose} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Box sx={{ m: 1, display: "flex", justifyContent: "center", textTransform: "uppercase" }}>
            <Typography variant="h5">Watch on</Typography>
          </Box>
          <Box sx={{ display: "flex", m: 1, flexDirection: isMobile ? "column" : "row" }}>
            {vod.youtube.length > 0 && (
              <CustomLink href={`/youtube/${props.vod.id}`}>
                <MenuItem>
                  <YouTubeIcon sx={{ mr: 1 }} />
                  Youtube
                </MenuItem>
              </CustomLink>
            )}
            {Date.now() - new Date(vod.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
              <CustomLink href={`/cdn/${props.vod.id}`}>
                <MenuItem>
                  <OndemandVideoIcon sx={{ mr: 1 }} />
                  CDN
                </MenuItem>
              </CustomLink>
            )}
            <CustomLink href={`/manual/${props.vod.id}`}>
              <MenuItem>
                <OpenInBrowserIcon sx={{ mr: 1 }} />
                Manual
              </MenuItem>
            </CustomLink>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});
