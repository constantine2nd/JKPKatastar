import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logoutUser } from "../features/userSlice";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

const Header = () => {
  const { i18n } = useTranslation();
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
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Katastar</Navbar.Brand>
          </LinkContainer>

          <Nav className="ml-auto">
            <PopupState variant="popover" popupId="graves-popup-menu">
              {(popupState) => (
                <React.Fragment>
                  <Button variant="contained" {...bindTrigger(popupState)}>
                    Dashboard
                  </Button>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem onClick={popupState.close}>
                      <LinkContainer to="/grave-requests-crud">
                        <Nav.Link>Zahtev za grobno mesto</Nav.Link>
                      </LinkContainer>
                    </MenuItem>
                    <MenuItem onClick={popupState.close}>
                      <LinkContainer to="/deceased-table">
                        <Nav.Link>Pregled pokojnika</Nav.Link>
                      </LinkContainer>
                    </MenuItem>
                    <MenuItem onClick={popupState.close}>
                      <LinkContainer to="/graves-table">
                        <Nav.Link>Pregled GM</Nav.Link>
                      </LinkContainer>
                    </MenuItem>
                    <MenuItem onClick={popupState.close}>
                      <LinkContainer to="/graves-table-crud">
                        <Nav.Link>Pregled GM CRUD</Nav.Link>
                      </LinkContainer>
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              )}
            </PopupState>
            {user && user.role === "SUPER_ADMIN" && (
              <>
                <PopupState
                  variant="popover"
                  popupId="administration-popup-menu"
                >
                  {(popupState) => (
                    <React.Fragment>
                      <Button variant="contained" {...bindTrigger(popupState)}>
                        Administration
                      </Button>
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem onClick={popupState.close}>
                          <LinkContainer to="/cemeteries-table-crud">
                            <Nav.Link>Cemeteries management</Nav.Link>
                          </LinkContainer>
                        </MenuItem>
                        <MenuItem onClick={popupState.close}>
                          <LinkContainer to="/users-table-crud">
                            <Nav.Link>User management</Nav.Link>
                          </LinkContainer>
                        </MenuItem>
                        <MenuItem onClick={popupState.close}>
                          <LinkContainer to="/grave-types-table">
                            <Nav.Link>Grave Types MGM</Nav.Link>
                          </LinkContainer>
                        </MenuItem>
                        <MenuItem onClick={popupState.close}>
                          <LinkContainer to="/grave-types-crud">
                            <Nav.Link>Grave Types MGM CRUD</Nav.Link>
                          </LinkContainer>
                        </MenuItem>
                      </Menu>
                    </React.Fragment>
                  )}
                </PopupState>
              </>
            )}
            {user && (
              <NavDropdown title={user.name} id="profile">
                <NavDropdown.Item onClick={logoutHandler}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {!user && (
              <LinkContainer to="/login-user">
                <Nav.Link>Login</Nav.Link>
              </LinkContainer>
            )}
            {!user && (
              <LinkContainer to="/add-user">
                <Nav.Link>Register</Nav.Link>
              </LinkContainer>
            )}
            <NavDropdown
              title={`Select Language (${language.toLocaleUpperCase()})`}
              id="profile"
            >
              <NavDropdown.Item onClick={() => selectLangugeHandler("sr")}>
                SR
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => selectLangugeHandler("hu")}>
                HU
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
