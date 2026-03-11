import { useEffect, Component } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CustomLink from './CustomLink';
import Logo from '../assets/logo.png';

const Error = styled((props) => {
  const { channel } = props;
  useEffect(() => {
    document.title = `Error - ${channel}`;
  }, [channel]);
  return (
    <div {...props}>
      <img src={Logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <Typography variant="h5" color="error">
          Something went wrong
        </Typography>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <CustomLink href="/">
          <Button variant="outlined" color="primary">
            Go Home
          </Button>
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <Error channel={this.props.channel} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
