import React, { useEffect, useState } from "react";
import { Box, Typography, Pagination, Grid, useMediaQuery, Alert, AlertTitle, PaginationItem } from "@mui/material";
import SimpleBar from "simplebar-react";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";
import Search from "./Search";
import { Link, useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_VODS_API_BASE;

export default function Vods() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [vods, setVods] = useState(null);
  const [totalVods, setTotalVods] = useState(null);
  const [cdn, setCdn] = useState(null);
  const page = parseInt(query.get("page") || "1", 10);
  const limit = isMobile ? 10 : 20;

  useEffect(() => {
    setVods(null);
    const fetchVods = async () => {
      await fetch(`${API_BASE}/vods?$limit=${limit}&$skip=${(page - 1) * limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setVods(response.data);
          setTotalVods(response.total);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [limit, page]);

  useEffect(() => {
    document.title = `VODS - xQc`;
    const fetchCDNStatus = async () => {
      await fetch(`${API_BASE}/cdn`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setCdn(response);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchCDNStatus();
  }, []);

  if (!vods || !cdn) return <Loading />;

  const totalPages = Math.ceil(totalVods / limit);
  const isCdnAvailable = cdn && cdn.enabled && cdn.available;

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ mt: 1, textAlign: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, flexDirection: "column", alignItems: "center" }}>
          {!isCdnAvailable && (
            <Alert severity="warning">
              <AlertTitle>CDN Playback is currently disabled due to 50TB Bandwidth Monthly Cap! Despairge.</AlertTitle>
              Consider using the "Manual" playback and Download the Vod using the Download button.
            </Alert>
          )}
          <Typography variant="h4" color="primary" sx={{ textTransform: "uppercase", fontWeight: "550" }}>
            {`${totalVods} Vods Archived`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ width: isMobile ? "100%" : "50%" }}>
            <Search isCdnAvailable={isCdnAvailable} />
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, _) => (
            <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} isCdnAvailable={isCdnAvailable} />
          ))}
        </Grid>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        {totalPages !== null && (
          <Pagination
            count={totalPages}
            disabled={totalPages <= 1}
            color="primary"
            page={page}
            renderItem={(item) => <PaginationItem component={Link} rel="canonical" to={`${location.pathname}${item.page === 1 ? "" : `?page=${item.page}`}`} {...item} />}
          />
        )}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
