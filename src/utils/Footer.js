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
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", mb: 0.5 }}>
      <CustomLink href="https://twemoji.twitter.com/" rel="noopener noreferrer" target="_blank" sx={{ mr: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          Twemoji graphics made by Twitter and other contributors,
        </Typography>
      </CustomLink>
      <CustomLink href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">
        <Typography variant="caption" color="textSecondary">
          Licensed under CC-BY 4.0
        </Typography>
      </CustomLink>
    </Box>
    <CustomLink href={`${process.env.REACT_APP_GITHUB}/commit/${gitInfo.commit.shortHash}`} rel="noopener noreferrer" target="_blank">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          {`Version: ${gitInfo.commit.shortHash}`}
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
