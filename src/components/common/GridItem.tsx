import { Grid, GridProps } from '@mui/material';
import { ElementType } from 'react';

interface ExtendedGridProps extends GridProps {
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  component?: ElementType;
}

export const GridItem: React.FC<ExtendedGridProps> = ({ children, ...props }) => {
  return (
    <Grid item {...props}>
      {children}
    </Grid>
  );
}; 