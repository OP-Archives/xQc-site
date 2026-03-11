import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function EnvironmentError({ missingVars }) {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e0e10',
        color: '#fff',
        padding: 4,
      }}
    >
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Configuration Error
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          marginBottom: '16px',
        }}
      >
        The application cannot start because required environment variables are missing.
      </Typography>
      <Box sx={{ backgroundColor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 1, my: 2 }}>
        <Typography variant="body2" fontFamily="monospace" color="#ff5252">
          {missingVars.join('\n')}
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary">
        Please ensure all required environment variables are set in your .env file.
      </Typography>
    </Box>
  );
}
