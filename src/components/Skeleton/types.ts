export interface SkeletonProps {
  loading?: boolean;
  type?: "text" | "circle" | "rect" | "table" | "card";
  rows?: number;
  count?: number;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}
