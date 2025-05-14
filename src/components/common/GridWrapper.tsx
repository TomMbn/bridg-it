import { Grid, GridProps } from '@mui/material';

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