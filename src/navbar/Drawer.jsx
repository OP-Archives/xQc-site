import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ReportIcon from '@mui/icons-material/Report';

const mainLinks = [
  { title: `Home`, path: `/`, icon: <HomeIcon color="primary" /> },
  { title: `Vods`, path: `/vods`, icon: <OndemandVideoIcon color="primary" /> },
  { title: `Issues`, path: `${import.meta.env.VITE_GITHUB}/issues`, icon: <ReportIcon color="primary" /> },
];

export default function DrawerComponent(props) {
  const { socials } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ mr: 1 }}>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {mainLinks.map(({ title, path, icon }) => (
            <Box key={title}>
              <ListItem onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>
                  <Link color="primary" href={path}>
                    {title}
                  </Link>
                </ListItemText>
              </ListItem>
              <Divider />
            </Box>
          ))}
          <Divider />
          <Box sx={{ display: 'flex', p: 2 }}>
            {socials.map(({ path, icon }) => (
              <Box key={path} sx={{ mr: 2 }}>
                <Link href={path} rel="noopener noreferrer" target="_blank">
                  {icon}
                </Link>
              </Box>
            ))}
          </Box>
        </List>
      </Drawer>
      <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
        <Menu color="primary" />
      </IconButton>
    </Box>
  );
}
