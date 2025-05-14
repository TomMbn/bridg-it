import { Grid, GridProps, Theme } from '@mui/material';
import { ElementType } from 'react';
import { SystemProps } from '@mui/system';

type ResponsiveGridProps = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

interface GridWrapperProps extends GridProps, ResponsiveGridProps {
  isItem?: boolean;
}

export const GridWrapper = ({ isItem, ...props }: GridWrapperProps) => {
  const gridProps = {
    ...props,
    ...(isItem ? { item: true } : {})
  };

  return <Grid {...gridProps} />;
}; 