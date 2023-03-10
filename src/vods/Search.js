import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, MenuItem, Autocomplete, TextField, CircularProgress } from "@mui/material";
import Thumbnail from "../assets/default_thumbnail.png";
import CustomLink from "../utils/CustomLink";
import debounce from "lodash.debounce";

const API_BASE = process.env.REACT_APP_VODS_API_BASE;

export default function Search(props) {
  const { isCdnAvailable } = props;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(undefined);
  const [searchResults, setSearchResults] = useState([]);

  const debouncedSearch = useMemo(() => {
    const searchChange = (evt) => {
      if (evt.target.value.length === 0) return;
      setSearch(evt.target.value);
    };
    return debounce(searchChange, 300);
  }, []);

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
    <Autocomplete
      freeSolo
      disableClearable
      options={searchResults}
      getOptionLabel={(vod) => (vod ? vod.id : "")}
      filterOptions={(options, _) => options}
      loading={loading}
      renderOption={(props, vod) => {
        const DEFAULT_VOD =
          vod.youtube.length > 0 ? `/youtube/${vod.id}` : Date.now() - new Date(vod.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000 && isCdnAvailable ? `/cdn/${vod.id}` : `/manual/${vod.id}`;
        const DEFAULT_THUMBNAIL = vod.thumbnail_url ? vod.thumbnail_url : Thumbnail;
        return (
          <MenuItem {...props}>
            <CustomLink href={DEFAULT_VOD} sx={{ width: "100%", display: "flex" }}>
              <Box sx={{ mr: 1 }}>
                <img alt="" src={DEFAULT_THUMBNAIL} style={{ width: "128px", height: "72px" }} />
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
          onChange={debouncedSearch}
        />
      )}
      sx={{ flex: 1, pt: 1, pb: 1 }}
    />
  );
}
