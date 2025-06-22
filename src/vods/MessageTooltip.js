// MessageTooltip.js
// This file defines a custom-styled Tooltip component for chat messages using Material-UI (MUI).
// It overrides the default tooltip background and text color to match the application
// The component disables portal rendering for the tooltip and applies custom styles using MUI's styled API.

import React from "react";
import { Tooltip, styled, tooltipClasses } from "@mui/material";

// Create a styled Tooltip component with custom background and text color.
// The PopperProps disables portal rendering, and slotProps applies the custom className to the popper.
const MessageTooltip = styled(({ className, ...props }) => 
  <Tooltip 
    {...props} 
    PopperProps={{ disablePortal: true }} 
    slotProps={{ popper: { className } }} 
  />
)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#fff",
    color: "rgba(0, 0, 0, 0.87)",
  },
}));

export default MessageTooltip;
