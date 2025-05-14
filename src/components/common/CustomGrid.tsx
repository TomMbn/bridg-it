import { Grid, GridProps } from '@mui/material';
import { forwardRef } from 'react';

export const CustomGrid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  return <Grid ref={ref} {...props} />;
});

CustomGrid.displayName = 'CustomGrid'; 