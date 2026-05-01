import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CustomLink from '../utils/CustomLink';
import humanize from 'humanize-duration';
import { toHMS, toSeconds, getImage } from '../utils/helpers';

export default function Chapters(props) {
  const { vod, isCdnAvailable } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const DEFAULT_VOD =
    vod.youtube.length > 0
      ? `/youtube/${vod.id}`
      : Date.now() - new Date(vod.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000 && isCdnAvailable
        ? `/cdn/${vod.id}`
        : `#`;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Tooltip title={vod.chapters[0].name}>
        <IconButton onClick={handleClick}>
          <img alt="" src={getImage(vod.chapters[0].image)} style={{ width: '40px', height: '53px' }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {vod.chapters.map((data) => {
          return (
            <CustomLink
              key={vod.id + (data?.gameId || data.name) + (data?.start || data.duration)}
              href={`${DEFAULT_VOD}?t=${toHMS(data?.start || toSeconds(data.duration) || 1)}`}
            >
              <MenuItem>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ mr: 1 }}>
                    <img alt="" src={getImage(data.image)} style={{ width: '40px', height: '53px' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography color="primary" variant="body2">{`${data.name}`}</Typography>
                    {data.end !== undefined && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                      >{`${humanize(data.end * 1000, { largest: 2 })}`}</Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            </CustomLink>
          );
        })}
      </Menu>
    </Box>
  );
}
