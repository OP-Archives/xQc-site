import { styled, Typography } from "@mui/material";
import CustomLink from "./CustomLink";
import xqcL from "../assets/xqcL.png";

const Footer = styled((props) => (
  <div {...props}>
    <div style={{ marginTop: "0.5rem" }}>
      <Typography variant="caption" color="textSecondary">
        {`xQc © ${new Date().getFullYear()}`}
      </Typography>
    </div>
    <CustomLink href="https://twitter.com/overpowered" rel="noopener noreferrer" target="_blank">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="caption" color="textSecondary">
          made by OP with
        </Typography>
        <div style={{ marginLeft: "6px" }}>
          <img alt="" src={xqcL} height="24" width="24" />
        </div>
      </div>
    </CustomLink>
  </div>
))`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Footer;
