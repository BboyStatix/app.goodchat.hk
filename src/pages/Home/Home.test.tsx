import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "pages/Home/Home";
import AuthProvider from "components/AuthProvider/AuthProvider";
import userEvent, { TargetElement } from "@testing-library/user-event";
import * as UseAuthModule from "hooks/useAuth/useAuth";

test("renders correctly", () => {
  const { container } = render(<Home />);
  expect(container).toMatchSnapshot();
});

test("clicking log out button should call logout function", () => {
  const mockLogout = jest.fn();
  const mockUseAuth = jest.spyOn(UseAuthModule, "default").mockReturnValue({
    isAuthenticated: true,
    login: jest.fn(),
    logout: mockLogout,
  });

  render(
    <AuthProvider initialAuthState={true}>
      <Home />
    </AuthProvider>
  );

  const logoutButton = screen.getByText(/log out/i);
  userEvent.click(logoutButton as TargetElement);

  expect(mockLogout).toHaveBeenCalledTimes(1);

  mockUseAuth.mockRestore();
});