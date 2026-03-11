import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';

const CustomLink = styled((props) => <Link {...props} />)`
  &:hover {
    opacity: 50%;
  }
`;

export default CustomLink;
