import { createTheme } from '@mui/material/styles';

// Dreem Nest brand palette — deep purple primary, lime accent
const theme = createTheme({
  palette: {
    primary: {
      main: '#4b2e6f',
      dark: '#341f4d',
      light: '#6f4ea0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b5d335',
      dark: '#93ab21',
      light: '#c8df5e',
      contrastText: '#1c1530',
    },
    error:   { main: '#d8453a' },
    warning: { main: '#e0a721' },
    success: { main: '#2f9e64' },
    background: {
      default: '#f7f5fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1530',
      secondary: '#6b5d80',
    },
    divider: '#ddd6e8',
  },
  typography: {
    fontFamily: [
      'var(--font-sans)',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 20 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#6b5d80',
          borderBottom: '2px solid #ddd6e8',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export default theme;
