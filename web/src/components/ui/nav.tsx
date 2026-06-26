'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";

const DRAWER_WIDTH = 240;

// ─── SVG icon helper ──────────────────────────────────────────────────────────

function Icon({ path }: { path: string }) {
  return (
    <SvgIcon sx={{ fontSize: 20 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </SvgIcon>
  );
}

const ICONS: Record<string, string> = {
  admin:        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  warehouse:    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  payments:     "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  dfp:          "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  merchant:     "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  reports:      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  integrations: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  track:        "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  settings:     "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

type NavLink = { href: string; labelKey: string; icon: string; roles: string[] | null };

const navLinks: NavLink[] = [
  { href: "/admin",        labelKey: "nav.admin",        icon: "admin",        roles: ["admin", "dispatch"] },
  { href: "/warehouse",    labelKey: "nav.warehouse",    icon: "warehouse",    roles: ["admin", "warehouse"] },
  { href: "/payments",     labelKey: "nav.payments",     icon: "payments",     roles: ["admin", "dispatch"] },
  { href: "/reports",      labelKey: "nav.reports",      icon: "reports",      roles: ["admin", "dispatch"] },
  { href: "/integrations", labelKey: "nav.integrations", icon: "integrations", roles: ["admin"] },
  { href: "/dfp",          labelKey: "nav.dfp",          icon: "dfp",          roles: ["dfp"] },
  { href: "/merchant",     labelKey: "nav.merchant",     icon: "merchant",     roles: ["merchant"] },
  { href: "/track",        labelKey: "nav.track",        icon: "track",        roles: null },
  { href: "/settings",     labelKey: "nav.settings",     icon: "settings",     roles: ["admin"] },
];

// ─── Language toggle ──────────────────────────────────────────────────────────

function LangToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <Box sx={{ display: 'flex', gap: 0.5, border: '1px solid #ddd6e8', borderRadius: 2, p: 0.5, mx: 2, mb: 1 }}>
      {(['en', 'ar'] as const).map((l) => (
        <Box
          key={l}
          component="button"
          onClick={() => setLocale(l)}
          sx={{
            flex: 1, borderRadius: 1.5, px: 1, py: 0.5, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.7rem',
            bgcolor: locale === l ? 'primary.main' : 'transparent',
            color: locale === l ? 'white' : 'text.secondary',
            transition: 'all 0.15s',
          }}
        >
          {l === 'en' ? 'EN' : 'ع'}
        </Box>
      ))}
    </Box>
  );
}

// ─── Drawer content ───────────────────────────────────────────────────────────

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  const visible = navLinks.filter((l) => !l.roles || !user || l.roles.includes(user.role));

  function handleLogout() {
    logout();
    router.push('/login');
    onNavigate?.();
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Brand */}
      <Box sx={{ px: 2, py: 2.5 }}>
        <Link href="/" onClick={onNavigate} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 2, bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#b5d335', fontWeight: 900, fontSize: '1rem',
          }}>
            D
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
            Dreem Nest
          </Typography>
        </Link>
      </Box>

      <Divider sx={{ borderColor: '#ddd6e8' }} />

      {/* Nav links */}
      <List sx={{ flex: 1, overflowY: 'auto', py: 1, px: 1 }}>
        {visible.map((link) => {
          const active = pathname === link.href;
          return (
            <ListItem key={link.href} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={onNavigate}
                selected={active}
                sx={{
                  borderRadius: 3,
                  minHeight: 44,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                  '&:not(.Mui-selected)': {
                    color: 'text.secondary',
                    '&:hover': { bgcolor: '#ece7f4' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'white' : 'text.secondary' }}>
                  <Icon path={ICONS[link.icon] ?? ''} />
                </ListItemIcon>
                <ListItemText
                  primary={t(link.labelKey as Parameters<typeof t>[0])}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: active ? 700 : 500 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Language toggle */}
      <LangToggle />

      <Divider sx={{ borderColor: '#ddd6e8' }} />

      {/* User footer */}
      <Box sx={{ px: 2, py: 2 }}>
        {user ? (
          <>
            <Box sx={{ px: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: 2, color: 'text.secondary', fontSize: '0.875rem', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SvgIcon sx={{ fontSize: 18 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </SvgIcon>
              </ListItemIcon>
              <ListItemText primary={t('nav.signOut')} sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 } }} />
            </ListItemButton>
          </>
        ) : (
          <Link href="/login" onClick={onNavigate} style={{ textDecoration: 'none' }}>
            <Box sx={{
              textAlign: 'center', borderRadius: 2.5, bgcolor: 'primary.main',
              color: 'white', py: 1, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            }}>
              {t('nav.signIn')}
            </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
}

// ─── Sidebar shell ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: permanent drawer on the start side */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #ddd6e8',
            bgcolor: 'background.paper',
            // RTL: MUI handles this automatically
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Mobile: AppBar + temporary drawer */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: { lg: 'none' },
          bgcolor: 'background.paper',
          borderBottom: '1px solid #ddd6e8',
          color: 'text.primary',
          zIndex: 40,
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            sx={{ color: 'text.secondary' }}
          >
            <SvgIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </SvgIcon>
          </IconButton>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b5d335', fontWeight: 900, fontSize: '0.875rem' }}>D</Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>Dreem Nest</Typography>
          </Link>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': {
            width: Math.min(DRAWER_WIDTH + 40, 288),
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </>
  );
}

export { Sidebar as Navbar };
