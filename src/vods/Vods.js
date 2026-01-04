import { useEffect, useState, useMemo } from "react";
import { Box, Typography, Pagination, Grid, useMediaQuery, PaginationItem, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SimpleBar from "simplebar-react";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import vodsClient from "./client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FILTERS = ["Default", "Date", "Title", "Game"];
const PLATFORMS = ["All", "Twitch", "Kick"];
const START_DATE = process.env.REACT_APP_START_DATE;

export default function Vods() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [vods, setVods] = useState(null);
  const [totalVods, setTotalVods] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [filterStartDate, setFilterStartDate] = useState(dayjs(START_DATE));
  const [filterEndDate, setFilterEndDate] = useState(dayjs());
  const [filterTitle, setFilterTitle] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const page = parseInt(query.get("page") || "1", 10);
  const limit = isMobile ? 10 : 20;

  useEffect(() => {
    setVods(null);
    const fetchVods = async () => {
      let query = {
        $limit: limit,
        $skip: (page - 1) * limit,
        $sort: {
          createdAt: -1,
        },
        $and: [],
      };
      if (platform !== PLATFORMS[0]) {
        query.$and.push({ platform: platform.toLowerCase() });
      }
      switch (filter) {
        case "Date":
          if (filterStartDate > filterEndDate) {
            query = null;
            break;
          }
          query.$and.push({
            createdAt: {
              $gte: filterStartDate.toISOString(),
              $lte: filterEndDate.toISOString(),
            },
          });
          break;
        case "Title":
          if (filterTitle.length === 0) {
            query = null;
            break;
          }
          query.$and.push({
            title: {
              $iLike: `%${filterTitle}%`,
            },
          });
          break;
        case "Game":
          if (filterGame.length === 0) {
            query = null;
            break;
          }
          if (platform === PLATFORMS[0]) {
            query.chapters = {
              name: filterGame,
            };
          } else {
            query.$and.push({
              chapters: {
                name: filterGame,
              },
            });
          }
          break;
        default:
          break;
      }
      if (query == null) return;
      vodsClient
        .service("vods")
        .find({
          query: query,
        })
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
  }, [limit, page, filter, filterStartDate, filterEndDate, filterTitle, filterGame, platform]);

  const changeFilter = (evt) => {
    setFilter(evt.target.value);
    //reset page to 1 when filter changes
    navigate(`${location.pathname}?page=1`);
  };

  const changePlatform = (evt) => {
    setPlatform(evt.target.value);
    //reset page to 1 when platform changes
    navigate(`${location.pathname}?page=1`);
  };

  const handleSubmit = (e) => {
    const value = e.target.value;
    if (e.which === 13 && !isNaN(value) && value > 0) {
      navigate(`${location.pathname}?page=${value}`);
    }
  };

  const handleTitleChange = useMemo(
    () =>
      debounce((evt) => {
        if (evt.target.value.length === 0) return;
        setFilterTitle(evt.target.value);
      }, 1000),
    [setFilterTitle]
  );

  const handleGameChange = useMemo(
    () =>
      debounce((evt) => {
        if (evt.target.value.length === 0) return;
        setFilterGame(evt.target.value);
      }, 1000),
    [setFilterGame]
  );

  const totalPages = Math.ceil(totalVods / limit);
  const isCdnAvailable = true;

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ mt: 1, textAlign: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, flexDirection: "column", alignItems: "center" }}>
          {totalVods && (
            <Typography variant="h4" color="primary" sx={{ textTransform: "uppercase", fontWeight: "550" }}>
              {`${totalVods} Vods`}
            </Typography>
          )}
        </Box>
        <Box sx={{ pl: !isMobile ? 5 : 3, pr: !isMobile ? 5 : 3, pt: 1, display: "flex", flexDirection: "row", alignItems: "center" }}>
          <FormControl sx={{ display: "flex" }}>
            <InputLabel id="select-label">Filter</InputLabel>
            <Select labelId="select-label" label={filter} value={filter} onChange={changeFilter} autoWidth>
              {FILTERS.map((data, i) => {
                return (
                  <MenuItem key={i} value={data}>
                    {data}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {filter === "Date" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ ml: 1 }}>
                <DatePicker
                  minDate={dayjs(START_DATE)}
                  maxDate={dayjs()}
                  sx={{ mr: 1 }}
                  label="Start Date"
                  defaultValue={filterStartDate}
                  onAccept={(newDate) => setFilterStartDate(newDate)}
                  views={["year", "month", "day"]}
                />
                <DatePicker
                  minDate={dayjs(START_DATE)}
                  maxDate={dayjs()}
                  label="End Date"
                  defaultValue={filterEndDate}
                  onAccept={(newDate) => setFilterEndDate(newDate)}
                  views={["year", "month", "day"]}
                />
              </Box>
            </LocalizationProvider>
          )}
          {filter === "Title" && (
            <Box sx={{ ml: 1 }}>
              <TextField fullWidth label="Search by Title" type="text" onChange={handleTitleChange} defaultValue={filterTitle} />
            </Box>
          )}
          {filter === "Game" && (
            <Box sx={{ ml: 1 }}>
              <TextField fullWidth label="Search by Game" type="text" onChange={handleGameChange} defaultValue={filterGame} />
            </Box>
          )}
          <FormControl sx={{ ml: 1, display: "flex", minWidth: "5rem" }}>
            <InputLabel id="platform-select-label">Platform</InputLabel>
            <Select labelId="platform-select-label" label={platform} value={platform} onChange={changePlatform} autoWidth>
              {PLATFORMS.map((data, i) => {
                return (
                  <MenuItem key={i} value={data}>
                    {data}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        {vods ? (
          <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
            {vods.map((vod, _) => (
              <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} isCdnAvailable={isCdnAvailable} />
            ))}
          </Grid>
        ) : (
          <Loading />
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2, alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
        {totalPages !== null && (
          <>
            <Pagination
              shape="rounded"
              variant="outlined"
              count={totalPages}
              disabled={totalPages <= 1}
              color="primary"
              page={page}
              renderItem={(item) => <PaginationItem component={Link} to={`${location.pathname}${item.page === 1 ? "" : `?page=${item.page}`}`} {...item} />}
            />
            <TextField
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">Page</InputAdornment>,
              }}
              sx={{
                width: "100px",
                m: 1,
              }}
              size="small"
              type="text"
              onKeyDown={handleSubmit}
            />
          </>
        )}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
