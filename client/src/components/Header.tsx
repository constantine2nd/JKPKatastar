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
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Link,
  ListItemIcon,
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
import { ADMINISTRATOR, OFFICER, VISITOR } from "../utils/constant.js";

const pages = [
  { item: "Pregled pokojnika", link: "deceased-table", roles: [] },
  { item: "Pretraga pokojnika", link: "search-deceased", roles: [] },
  // { item: "Pregled GM", link: "graves-table", logged: false, role: "" },
  { item: "Pregled GM CRUD", link: "graves-table-crud", roles: [] },
  {
    item: "Zahtev za grobno mesto",
    link: "grave-requests-crud",
    roles: [VISITOR, OFFICER, ADMINISTRATOR],
  },
  {
    item: "Cemeteries managment",
    link: "cemeteries-table-crud",
    roles: [OFFICER, ADMINISTRATOR],
  },
  {
    item: "User management",
    link: "users-table-crud",
    roles: [ADMINISTRATOR],
  },
  // { item: "Grave Types MGM", link: "grave-types-table" },
  {
    item: "Grave Types MGM CRUD",
    link: "grave-types-crud",
    roles: [OFFICER, ADMINISTRATOR],
  },
];

const Header = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("sr");
  const user = useSelector(selectUser);

  const dispatch = useDispatch<any>();
  let navigate = useNavigate();

  // Change language and store it in local storage.
  // Please note that the Header component is visible at any page i.e. globaly
  // and this affects the whole app.
  const selectLangugeHandler = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("selected-language", lang);
  };

  // Get language from a local storage and set it for a whole app.
  // Please note that the Header component is visible at any page i.e. globaly
  // and this affects the whole app.
  useEffect(() => {
    const languageFromStorage = localStorage.getItem("selected-language");
    const selectedLanguage = languageFromStorage ? languageFromStorage : "sr";
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  }, []);

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigate("/login-user");
  };
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
              href="#app-bar-with-responsive-menu"
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

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages
                  .filter(
                    (page) =>
                      page.roles?.length === 0 ||
                      page.roles?.find((role) => user?.role === role)
                  )
                  .map((page) => navBarMenuItem(page))}
              </Menu>
            </Box>

            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
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
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages
                .filter(
                  (page) =>
                    page.roles?.length === 0 ||
                    page.roles?.find((role) => user?.role === role)
                )
                .map((page) => navBarButton(page))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.name}
                    src={user?.avatarUrl}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {!user && (
                  <MenuItem key={"Login"} href="/login-user" component={Link}>
                    <ListItemIcon>
                      <Login fontSize="small" />
                    </ListItemIcon>
                    {t("Sign in")}
                  </MenuItem>
                )}
                {!user && (
                  <MenuItem key={"Register"} href="/add-user" component={Link}>
                    <ListItemIcon>
                      <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    {t("Sign up")}
                  </MenuItem>
                )}
                {user && (
                  <MenuItem onClick={logoutHandler}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    {t("Logout")}
                  </MenuItem>
                )}
              </Menu>
            </Box>

            <Box>
              <IconButton
                sx={{ ml: 1 }}
                onClick={colorMode.toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Box>
            <Box>
              <NavDropdown title={`(${language.toLocaleUpperCase()})`}>
                <NavDropdown.Item onClick={() => selectLangugeHandler("sr")}>
                  SR
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => selectLangugeHandler("hu")}>
                  HU
                </NavDropdown.Item>
              </NavDropdown>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );

  function navBarButton(page: { item: string; link: string }) {
    return (
      <Button
        key={page.item}
        href={page.link}
        component={Link}
        sx={{ my: 2, color: "white", display: "block" }}
      >
        {page.item}
      </Button>
    );
  }

  function navBarMenuItem(page: { item: string; link: string }) {
    return (
      <MenuItem key={page.item} href={page.link} component={Link}>
        <Typography textAlign="center">{page.item}</Typography>
      </MenuItem>
    );
  }
};

export default Header;
