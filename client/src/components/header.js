import { Button, Row } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";

import { useAuthDispatch, useAuthState } from "context/auth";

export default function Header() {
  const history = useHistory();
  const dispatch = useAuthDispatch();
  const { user } = useAuthState();

  console.log({ user });

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });

    history.push("/login");
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
