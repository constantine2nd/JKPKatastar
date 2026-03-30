import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logoutUser } from "../features/userSlice";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListSubheader,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../App";
import AdbIcon from "@mui/icons-material/Adb";
import Logout from "@mui/icons-material/Logout";
import Login from "@mui/icons-material/Login";
import PersonAdd from "@mui/icons-material/PersonAdd";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ADMINISTRATOR, OFFICER, MAINTAINER } from "../utils/constant.js";
import AboutDialog from "./AboutDialog";

interface PageItem {
  item: string;
  link: string;
}

interface PageGroup {
  label: string;
  minRole: string;
  items: PageItem[];
}

const Header = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectUser);

  // Flat public pages — visible to everyone
  const publicPages: PageItem[] = [
    { item: t("menu.search-deceased"), link: "search-deceased" },
    { item: t("menu.view-grave"), link: "graves-table-crud" },
    // Grave Request: visitors/guests go to stepper, officers+ go to management table
    {
      item: t("menu.grave-request"),
      link: (user?.role === OFFICER || user?.role === ADMINISTRATOR || user?.role === MAINTAINER)
        ? "grave-requests-crud"
        : "grave-requests-stepper",
    },
  ];

  // Role-gated dropdown groups
  const groups: PageGroup[] = [
    {
      label: t("menu.group-officer"),
      minRole: OFFICER,
      items: [
        { item: t("menu.view-deceased"), link: "deceased-table" },
        { item: t("menu.cemeteries"), link: "cemeteries-table-crud" },
        { item: t("menu.grave-types"), link: "grave-types-crud" },
      ],
    },
    {
      label: t("menu.group-admin"),
      minRole: ADMINISTRATOR,
      items: [
        { item: t("menu.user-management"), link: "users-table-crud" },
      ],
    },
    {
      label: t("menu.group-maintainer"),
      minRole: MAINTAINER,
      items: [
        { item: t("menu.import"), link: "import" },
        { item: t("menu.export"), link: "export" },
      ],
    },
  ];

  const hasMinRole = (minRole: string) => {
    if (!user) return false;
    if (minRole === OFFICER) return user.role === OFFICER || user.role === ADMINISTRATOR || user.role === MAINTAINER;
    if (minRole === ADMINISTRATOR) return user.role === ADMINISTRATOR || user.role === MAINTAINER;
    if (minRole === MAINTAINER) return user.role === MAINTAINER;
    return false;
  };

  const visibleGroups = groups.filter((g) => hasMinRole(g.minRole));

  const [aboutOpen, setAboutOpen] = useState(false);

  // Anchor state for each dropdown: keyed by group label
  const [groupAnchors, setGroupAnchors] = useState<Record<string, HTMLElement | null>>({});
  const openGroup = (label: string, el: HTMLElement) =>
    setGroupAnchors((prev) => ({ ...prev, [label]: el }));
  const closeGroup = (label: string) =>
    setGroupAnchors((prev) => ({ ...prev, [label]: null }));

  // Mobile nav menu anchor
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [language, setLanguage] = useState("sr");
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const selectLangugeHandler = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("selected-language", lang);
  };

  useEffect(() => {
    const languageFromStorage = localStorage.getItem("selected-language");
    const selectedLanguage = languageFromStorage ? languageFromStorage : "sr";
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  }, [i18n]);

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigate("/login-user");
  };

  // All items flattened for mobile menu
  const allMobileItems: PageItem[] = [
    ...publicPages,
    ...visibleGroups.flatMap((g) => g.items),
    { item: t("menu.manual"), link: "manual" },
  ];

  return (
    <header>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/landing"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              KATASTAR
            </Typography>

            {/* Mobile hamburger */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={(e) => setAnchorElNav(e.currentTarget)}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                onClose={() => setAnchorElNav(null)}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {/* Group labels as subheaders in mobile menu */}
                {publicPages.map((page) => (
                  <MenuItem key={page.link} href={page.link} component={Link} onClick={() => setAnchorElNav(null)}>
                    <Typography>{page.item}</Typography>
                  </MenuItem>
                ))}
                {visibleGroups.map((group) => [
                  <Divider key={`div-${group.label}`} />,
                  <ListSubheader key={`hdr-${group.label}`} sx={{ lineHeight: "32px", bgcolor: "transparent", color: "text.secondary", fontSize: "0.75rem" }}>
                    {group.label}
                  </ListSubheader>,
                  ...group.items.map((page) => (
                    <MenuItem key={page.link} href={page.link} component={Link} onClick={() => setAnchorElNav(null)}>
                      <Typography sx={{ pl: 1 }}>{page.item}</Typography>
                    </MenuItem>
                  )),
                ])}
                <Divider />
                <MenuItem href="manual" component={Link} onClick={() => setAnchorElNav(null)}>
                  <Typography>{t("menu.manual")}</Typography>
                </MenuItem>
              </Menu>
            </Box>

            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/landing"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              KATASTAR
            </Typography>

            {/* Desktop nav */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {/* Public flat buttons */}
              {publicPages.map((page) => (
                <Button
                  key={page.link}
                  href={page.link}
                  component={Link}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.item}
                </Button>
              ))}

              {/* Role-gated dropdown groups */}
              {visibleGroups.map((group) => (
                <React.Fragment key={group.label}>
                  <Button
                    sx={{ my: 2, color: "white" }}
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(e) => openGroup(group.label, e.currentTarget)}
                  >
                    {group.label}
                  </Button>
                  <Menu
                    anchorEl={groupAnchors[group.label] ?? null}
                    open={Boolean(groupAnchors[group.label])}
                    onClose={() => closeGroup(group.label)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                  >
                    {group.items.map((page) => (
                      <MenuItem
                        key={page.link}
                        href={page.link}
                        component={Link}
                        onClick={() => closeGroup(group.label)}
                      >
                        {page.item}
                      </MenuItem>
                    ))}
                  </Menu>
                </React.Fragment>
              ))}

              {/* Manual — always last */}
              <Button
                href="manual"
                component={Link}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {t("menu.manual")}
              </Button>
            </Box>

            {/* User avatar menu */}
            <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}>
              {user && (
                <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "flex-end" }}>
                  <Typography variant="body2" sx={{ color: "inherit", fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "inherit", opacity: 0.75, lineHeight: 1.2 }}>
                    {t(user.role)}
                  </Typography>
                </Box>
              )}
              <Tooltip title={user ? user.name : t("auth.sign-in")}>
                <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar alt={user?.name} src={user?.avatarUrl} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar-user"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
              >
                {user && (
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{t(user.role)}</Typography>
                  </Box>
                )}
                {user && <Divider />}
                {!user && (
                  <MenuItem key="Login" href="/login-user" component={Link}>
                    <ListItemIcon><Login fontSize="small" /></ListItemIcon>
                    {t("auth.sign-in")}
                  </MenuItem>
                )}
                {!user && (
                  <MenuItem key="Register" href="/add-user" component={Link}>
                    <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
                    {t("auth.sign-up")}
                  </MenuItem>
                )}
                {user && (
                  <MenuItem onClick={logoutHandler}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    {t("actions.logout")}
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => { setAnchorElUser(null); setAboutOpen(true); }}>
                  <ListItemIcon><InfoOutlinedIcon fontSize="small" /></ListItemIcon>
                  {t("about.title")}
                </MenuItem>
              </Menu>
              <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
            </Box>

            {/* Dark/light toggle */}
            <Box>
              <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>

            {/* Language picker */}
            <Box>
              <NavDropdown title={`(${language.toLocaleUpperCase()})`}>
                <NavDropdown.Item onClick={() => selectLangugeHandler("sr")}>SR</NavDropdown.Item>
                <NavDropdown.Item onClick={() => selectLangugeHandler("sr-Cyrl")}>СР</NavDropdown.Item>
                <NavDropdown.Item onClick={() => selectLangugeHandler("hu")}>HU</NavDropdown.Item>
                <NavDropdown.Item onClick={() => selectLangugeHandler("en")}>EN</NavDropdown.Item>
              </NavDropdown>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
};

export default Header;
