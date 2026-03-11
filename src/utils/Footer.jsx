import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CustomLink from './CustomLink';

const hash = __GIT_HASH__;

const Footer = styled((props) => (
  <Box {...props}>
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="textSecondary">
        {`${import.meta.env.VITE_CHANNEL} © ${new Date().getFullYear()}`}
      </Typography>
    </Box>
    <CustomLink href="https://twitter.com/overpowered" rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          made by OP with 💜
        </Typography>
      </Box>
    </CustomLink>
    <CustomLink href={`${import.meta.env.VITE_GITHUB}/commit/${hash}`} rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          {`Build Version: ${hash}`}
        </Typography>
      </Box>
    </CustomLink>
  </Box>
))`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`;

export default Footer;
