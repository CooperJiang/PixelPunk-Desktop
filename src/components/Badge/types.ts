export interface BadgeProps {
  type?: "primary" | "success" | "warning" | "danger" | "info" | "default";
  dot?: boolean;
  count?: number;
  max?: number;
  showZero?: boolean;
}
