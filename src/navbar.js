import React, { useEffect, useState, useRef } from "react";
import { AppBar, Toolbar, Box, Typography, MenuItem, Autocomplete, TextField, CircularProgress, useMediaQuery } from "@mui/material";
import Logo from "./assets/logo.png";
import CustomLink from "./utils/CustomLink";
import default_thumbnail from "./assets/default_thumbnail.png";
import TwitterIcon from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";

const API_BASE = "https://api.xqc.wtf";

export default function NavBar() {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(undefined);
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeout = useRef(null);

  const onChange = (evt) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(evt.target.value);
    }, 300);
  };

  useEffect(() => {
    if (!search) return;
    setLoading(true);
    const fetchSearch = async () => {
      await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: search,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.error) return;
          setSearchResults(response.data);
        })
        .catch((e) => {
          console.error(e);
        });
      setLoading(false);
    };
    fetchSearch();
  }, [search]);

  return (
    <Box sx={{ flex: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Box sx={{ mr: 2 }}>
              <a href="/">
                <img alt="" style={{ maxWidth: "45px", height: "auto" }} src={Logo} />
              </a>
            </Box>

            <Typography variant="h6" component="div">
              <CustomLink color="inherit" href="/">
                xQc Vods
              </CustomLink>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {!isMobile && (
              <>
                <Autocomplete
                  freeSolo
                  disableClearable
                  options={searchResults}
                  getOptionLabel={(vod) => (vod ? vod.id : "")}
                  filterOptions={(options, _) => options}
                  loading={loading}
                  renderOption={(props, vod) => {
                    return (
                      <MenuItem {...props}>
                        <CustomLink href={vod.youtube.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`} sx={{ width: "100%", display: "flex" }}>
                          <Box sx={{ mr: 1 }}>
                            <img alt="" src={vod.thumbnail_url ? vod.thumbnail_url : default_thumbnail} style={{ width: "128px", height: "72px" }} />
                          </Box>
                          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <Typography color="inherit" variant="body2" noWrap>{`${vod.title}`}</Typography>
                            <Typography color="textSecondary" variant="caption" noWrap>{`${vod.date}`}</Typography>
                          </Box>
                        </CustomLink>
                      </MenuItem>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search"
                      InputProps={{
                        ...params.InputProps,
                        type: "search",
                        endAdornment: (
                          <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                      onChange={onChange}
                    />
                  )}
                  sx={{ flex: 1, pt: 1, pb: 1 }}
                />
              </>
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "end", flex: 1 }}>
            <Box sx={{ mr: 2 }}>
              <a href="https://twitter.com/xqc" rel="noopener noreferrer" target="_blank">
                <TwitterIcon />
              </a>
            </Box>
            <Box sx={{ mr: 2 }}>
              <a href="https://twitch.tv/xqc" rel="noopener noreferrer" target="_blank">
                <SvgIcon>
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </SvgIcon>
              </a>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
