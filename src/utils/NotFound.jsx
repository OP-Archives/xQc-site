import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CustomLink from './CustomLink';
import Logo from '../assets/logo.png';

const NotFound = styled((props) => {
  const { channel } = props;
  document.title = `Not Found - ${channel}`;
  return (
    <div {...props}>
      <img src={Logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <CustomLink href="/">
          <Typography variant="body2" color="textSecondary">
            Nothing over here..
          </Typography>
        </CustomLink>
      </div>
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

export default NotFound;
