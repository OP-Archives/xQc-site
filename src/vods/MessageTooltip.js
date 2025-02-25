import React from "react";
import { Tooltip, styled, tooltipClasses } from "@mui/material";

const MessageTooltip = styled(({ className, ...props }) => 
  <Tooltip {...props} PopperProps={{ disablePortal: true }} classes={{ popper: className }} />
)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#fff",
    color: "rgba(0, 0, 0, 0.87)",
  },
}));

export default MessageTooltip;
