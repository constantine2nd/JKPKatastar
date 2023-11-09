import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { BrowserRouter as Router } from "react-router-dom";
import store from "../store";
import { Provider } from "react-redux";
import userEvent from '@testing-library/user-event';

test("Test login form", async () => {
  render(
    <Provider store={store}> // Set context
      <Router>
        <App />
      </Router>
    </Provider>
  );
  screen.debug();
  const linkElement = screen.getByText(/Select Language/i);
  expect(linkElement).toBeInTheDocument();
  expect(screen.getByText(/Katastar/i)).toBeInTheDocument();
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByText(/Register/i)).toBeInTheDocument();
  act(() => {
    /* fire events that update state */
    userEvent.click(screen.getByText('Login'))
  });
  const passwordField = await screen.findByText(/Password/);
  expect(passwordField).toBeInTheDocument();
  const emailField = await screen.findByText(/Email/);
  expect(emailField).toBeInTheDocument();
  screen.debug();
});
