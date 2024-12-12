import { styled, IconButton } from "@mui/material";

const ExpandMore = styled(({ expand, ...props }, ref) => <IconButton {...props} />)`
  margin-left: auto;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  ${(props) =>
    props.expand
      ? `
        transform: rotate(180deg);
      `
      : `
        transform: rotate(0deg);
      `}
`;

export default ExpandMore;
