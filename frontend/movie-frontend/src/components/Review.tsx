import * as React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';


export default function Review() {
  return (
    <React.Fragment>
      <Typography align='center' fontSize='26px' gutterBottom>
        Current User was successfully updated ✅
      </Typography>
      <Typography align='center' variant="h6" gutterBottom>
        Please click done to return to main page
      </Typography>
    </React.Fragment>
  );
}