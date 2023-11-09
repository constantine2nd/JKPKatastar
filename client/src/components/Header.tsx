import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logoutUser } from "../features/userSlice";

const Header = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState("sr");
  const user = useSelector(selectUser);

  const dispatch = useDispatch<any>();
  let navigate = useNavigate();

  const selectLangugeHandler = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

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
            <LinkContainer to="/deceased-table">
              <Nav.Link>Pregled pokojnika</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/graves-table">
              <Nav.Link>Pregled grobnih mesta</Nav.Link>
            </LinkContainer>
            {user && user.role === "SUPER_ADMIN" && (
              <>
                <LinkContainer to="/users-table">
                  <Nav.Link>User management</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/grave-types-table">
                  <Nav.Link>Grave Types MGM</Nav.Link>
                </LinkContainer>
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
