import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <MuiCard elevation={0} variant="outlined" sx={{ border: '1px solid #ddd6e8', borderRadius: 4, bgcolor: 'background.paper' }} className={className} {...(props as object)}>
      <MuiCardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {children}
      </MuiCardContent>
    </MuiCard>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }} className={className} {...(props as object)}>
      {children}
    </Typography>
  );
}
