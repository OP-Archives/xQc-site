import YouTubeIcon from '@mui/icons-material/YouTube';
import OndemandVideo from '@mui/icons-material/OndemandVideo';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function WatchMenu(props) {
  const { vod, anchorEl, setAnchorEl, isCdnAvailable } = props;

  return (
    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
      <Box sx={{ pl: 1 }}>
        <Box>
          <Button color="primary" disabled={vod.youtube.length === 0} href={`/youtube/${vod.id}`} startIcon={<YouTubeIcon />} size="large" fullWidth sx={{ justifyContent: 'flex-start' }}>
            Youtube (Vod)
          </Button>
        </Box>
        <Box>
          <Button
            color="primary"
            disabled={Date.now() - new Date(vod.createdAt).getTime() >= 14 * 24 * 60 * 60 * 1000 || !isCdnAvailable}
            href={`/cdn/${vod.id}`}
            startIcon={<OndemandVideo />}
            size="large"
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            CDN (VOD)
          </Button>
        </Box>
        <Box>
          <Button
            color="primary"
            disabled={Date.now() - new Date(vod.createdAt).getTime() >= 14 * 24 * 60 * 60 * 1000 || !isCdnAvailable}
            href={`/manual/${vod.id}`}
            size="large"
            startIcon={<OndemandVideo />}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            MANUAL (VOD)
          </Button>
        </Box>
        <Box>
          <Button color="primary" disabled={vod.games.length === 0} href={`/games/${vod.id}`} startIcon={<YouTubeIcon />} size="large" fullWidth sx={{ justifyContent: 'flex-start' }}>
            Youtube (Only Games)
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}
