import { tooltipClasses } from "@mui/material/Tooltip";
import { styled, Tooltip } from "@mui/material";

const CustomWidthTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

export default CustomWidthTooltip;
