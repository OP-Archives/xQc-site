import React, { useEffect, useState } from "react";
import { Box, Typography, Pagination, Grid, useMediaQuery } from "@mui/material";
import SimpleBar from "simplebar-react";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";
import Search from "./Search";

const limit = 20;
const API_BASE = "https://api.xqc.wtf";

export default function Vods() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [totalVods, setTotalVods] = useState(null);

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
          setTotalVods(response.total);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, []);

  const handlePageChange = (_, value) => {
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

  const totalPages = Math.ceil(totalVods / limit);

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h4" color="primary" sx={{ textTransform: "uppercase", fontWeight: "550" }}>
            {`${totalVods} Vods Archived`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ width: isMobile ? "100%" : "50%" }}>
            <Search />
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, _) => (
            <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} />
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
