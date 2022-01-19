import React, { useEffect } from "react";
import { Box, Typography, Button, Menu, MenuItem, Pagination, Grid, Tooltip, Link, styled } from "@mui/material";
import SimpleBar from "simplebar-react";
import ListIcon from "@mui/icons-material/List";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import CustomLink from "../utils/CustomLink";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import humanize from "humanize-duration";
import default_thumbnail from "../assets/default_thumbnail.png";
import { tooltipClasses } from "@mui/material/Tooltip";

const limit = 50;
const API_BASE = "https://api.xqc.wtf";

export default function Vods() {
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
          setVods(
            response.data.map((vod, i) => {
              return <Vod key={vod.id} vod={vod} />;
            })
          );
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

        setVods(
          response.data.map((vod, i) => {
            return <Vod key={vod.id} vod={vod} />;
          })
        );
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (loading) return <Loading />;

  return (
    <SimpleBar style={{ height: "calc(100% - 64px)" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods}
        </Grid>
        <Box sx={{ mt: 1, justifyContent: "center" }}>
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
  const { vod } = props;
  return (
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
        <Link href={`/youtube/${vod.id}`}>
          <img className="thumbnail" alt="" src={vod.thumbnail_url ? vod.thumbnail_url : default_thumbnail} />
        </Link>
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
                  <CustomLink component={Button} href={`/youtube/${vod.id}`} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    <Typography variant="caption" color="primary">
                      {vod.title}
                    </Typography>
                  </CustomLink>
                </span>
              </CustomWidthTooltip>
            </Box>
          </Box>
          <Box sx={{ display: "flex" }}>
            {vod.youtube.length > 1 && <PartsMenu vod={vod} />}
            {vod.chapters && vod.chapters.length > 1 && <ChaptersMenu vod={vod} />}
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const PartsMenu = (props) => {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Button onClick={handleClick}>
        <ListIcon />
        Parts
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.youtube.map((data, _) => {
          if (data.type === "vod") return null;
          return (
            <CustomLink key={data.id} href={`/youtube/${props.vod.id}?part=${data.part}`}>
              <MenuItem>Part {data.part}</MenuItem>
            </CustomLink>
          );
        })}
      </Menu>
    </Box>
  );
};

const ChaptersMenu = (props) => {
  const { vod } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Button onClick={handleClick}>
        <ListIcon />
        Chapters
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.chapters.map((data, _) => {
          return (
            <CustomLink key={data.gameId + data.start} href={`/youtube/${props.vod.id}?duration=${data.start}`}>
              <MenuItem>
                <Box sx={{ display: "flex" }}>
                  <Box sx={{ mr: 1 }}>
                    <img alt="" src={data.image} sx={{ height: "auto", maxWidth: "100%" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography color="inherit" variant="body2">{`${data.name}`}</Typography>
                    <Typography variant="caption">{`${humanize(data.end * 1000)}`}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            </CustomLink>
          );
        })}
      </Menu>
    </Box>
  );
};
