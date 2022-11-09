import { styled, Typography, Box } from "@mui/material";
import CustomLink from "./CustomLink";
import xqcL from "../assets/xqcL.png";
import GitInfo from 'react-git-info/macro';

const gitInfo = GitInfo();

const Footer = styled((props) => (
  <Box {...props}>
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="textSecondary">
        {`xQc © ${new Date().getFullYear()}`}
      </Typography>
    </Box>
    <CustomLink href="https://twitter.com/overpowered" rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="caption" color="textSecondary">
          made by OP with
        </Typography>
        <Box sx={{ ml: 0.5 }}>
          <img alt="" src={xqcL} height="24" width="24" />
        </Box>
      </Box>
    </CustomLink>
    <CustomLink href={`${process.env.REACT_APP_GITHUB}/commit/${gitInfo.commit.shortHash}`} rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          {`Build Version: ${gitInfo.commit.shortHash}`}
        </Typography>
      </Box>
    </CustomLink>
  </Box>
))`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Footer;
