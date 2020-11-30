import { Button, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAuthDispatch, useAuthState } from "context/auth";

export default function Header() {
  const dispatch = useAuthDispatch();
  const { user } = useAuthState();

  console.log({ user });

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });

    /**
     * To clear the cache store
     * We could use apollo client's client.resetStore()
     * or client.clearStore()
     * but it is bit confusing.
     * So reloading the login page is better option
     */
    window.location.href = "/login";
  };
  return (
    <Row className="bg-dark justify-content-around">
      {user ? null : (
        <>
          <Link to="/login">
            <Button variant="link">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="link">Register</Button>
          </Link>
        </>
      )}
      {!user ? null : (
        <Button variant="link" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </Row>
  );
}
