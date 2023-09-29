import React, { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState("sr");

  const selectLangugeHandler = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };
  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Katastar</Navbar.Brand>
          </LinkContainer>
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
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
