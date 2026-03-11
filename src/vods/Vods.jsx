import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import PaginationItem from '@mui/material/PaginationItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SimpleBar from 'simplebar-react';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import Vod from './Vod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import archiveClient from './client';
import { useDebouncedSetter } from '../utils/debounceHelper';

const FILTERS = ['Default', 'Date', 'Title', 'Game'];
const PLATFORMS = ['All', 'Twitch', 'Kick'];
const START_DATE = import.meta.env.VITE_START_DATE;
const isCdnAvailable = true;

export default function Vods() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [vods, setVods] = useState(null);
  const [totalVods, setTotalVods] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [filterStartDate, setFilterStartDate] = useState(dayjs(START_DATE));
  const [filterEndDate, setFilterEndDate] = useState(dayjs());
  const [filterTitle, setFilterTitle] = useState('');
  const [filterGame, setFilterGame] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const page = parseInt(query.get('page') || '1', 10);
  const limit = isMobile ? 10 : 20;

  useEffect(() => {
    setError(null);
    setLoading(true);
    setVods(null);

    const fetchVods = async () => {
      try {
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
          case 'Date':
            if (filterStartDate > filterEndDate) {
              setError('End date must be after start date');
              setLoading(false);
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
          case 'Title':
            if (filterTitle.length === 0) {
              setLoading(false);
              query = null;
              break;
            }
            query.$and.push({
              title: {
                $iLike: `%${filterTitle}%`,
              },
            });
            break;
          case 'Game':
            if (filterGame.length === 0) {
              query = null;
              setLoading(false);
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
        archiveClient
          .service('vods')
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
      } catch {
        setError('Failed to load VODs. Please try again later.');
      } finally {
        setLoading(false);
      }
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

  // Debounce filter searches to reduce API calls while typing
  const handleTitleChange = useDebouncedSetter(setFilterTitle, 500);
  const handleGameChange = useDebouncedSetter(setFilterGame, 500);

  const totalPages = Math.ceil(totalVods / limit);

  return (
    <SimpleBar style={{ minHeight: 0, height: '100%' }}>
      <Box sx={{ p: 2 }}>
        {error ? (
          <Typography variant="body1" color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexDirection: 'column', alignItems: 'center' }}>
              {totalVods !== null && (
                <Typography variant="h4" color="primary" sx={{ textTransform: 'uppercase', fontWeight: '550' }}>
                  {`${totalVods} Vods`}
                </Typography>
              )}
            </Box>
            <Box sx={{ pl: !isMobile ? 12 : 1, pr: !isMobile ? 12 : 1, pt: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <FormControl sx={{ display: 'flex' }}>
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
              {filter === 'Date' && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ ml: 1 }}>
                    <DatePicker
                      minDate={dayjs(START_DATE)}
                      maxDate={dayjs()}
                      sx={{ mr: 1 }}
                      label="Start Date"
                      defaultValue={filterStartDate}
                      onAccept={(newDate) => setFilterStartDate(newDate)}
                      views={['year', 'month', 'day']}
                    />
                    <DatePicker
                      minDate={dayjs(START_DATE)}
                      maxDate={dayjs()}
                      label="End Date"
                      defaultValue={filterEndDate}
                      onAccept={(newDate) => setFilterEndDate(newDate)}
                      views={['year', 'month', 'day']}
                    />
                  </Box>
                </LocalizationProvider>
              )}
              {filter === 'Title' && (
                <Box sx={{ ml: 1 }}>
                  <TextField fullWidth label="Search by Title" type="text" onChange={(e) => handleTitleChange(e.target.value)} defaultValue={filterTitle} />
                </Box>
              )}
              {filter === 'Game' && (
                <Box sx={{ ml: 1 }}>
                  <TextField fullWidth label="Search by Game" type="text" onChange={(e) => handleGameChange(e.target.value)} defaultValue={filterGame} />
                </Box>
              )}
              <FormControl sx={{ ml: 1, display: 'flex', minWidth: '5rem' }}>
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
            {loading ? <Loading /> : <></>}
            {vods && vods.length > 0 && (
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 2, justifyContent: 'center' }}>
                {vods.map((vod) => (
                  <Vod key={vod.id} vod={vod} isMobile={isMobile} isCdnAvailable={isCdnAvailable} />
                ))}
              </Grid>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2, alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
              {totalPages !== null && (
                <>
                  <Pagination
                    shape="rounded"
                    variant="outlined"
                    count={totalPages}
                    disabled={totalPages <= 1}
                    color="primary"
                    page={page}
                    renderItem={(item) => <PaginationItem component={Link} to={`${location.pathname}${item.page === 1 ? '' : `?page=${item.page}`}`} {...item} />}
                  />
                  <TextField
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">Page</InputAdornment>,
                      },
                    }}
                    sx={{
                      width: '100px',
                      m: 1,
                    }}
                    size="small"
                    type="text"
                    onKeyDown={handleSubmit}
                  />
                </>
              )}
            </Box>
          </>
        )}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
