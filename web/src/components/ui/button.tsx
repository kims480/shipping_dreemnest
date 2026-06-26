import MuiButton from '@mui/material/Button';
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const MUI_VARIANT = {
  primary: 'contained',
  accent: 'contained',
  outline: 'outlined',
  ghost: 'text',
} as const;

const MUI_COLOR = {
  primary: 'primary',
  accent: 'secondary',
  outline: 'primary',
  ghost: 'primary',
} as const;

export function Button({ variant = 'primary', className, children, disabled, onClick, type, ...rest }: ButtonProps) {
  return (
    <MuiButton
      variant={MUI_VARIANT[variant]}
      color={MUI_COLOR[variant]}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler}
      type={type as 'button' | 'submit' | 'reset'}
      size="small"
      className={className}
      sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '10px' }}
    >
      {children}
    </MuiButton>
  );
}
