import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { gql, useLazyQuery } from "@apollo/client";

import { useAuthDispatch } from "context/auth";

const LOGIN_USER = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      token
      createdAt
    }
  }
`;

export default function Login() {
  const dispatch = useAuthDispatch();
  const history = useHistory();
  const [state, setState] = useState({
    username: "",
    password: "",
  });
  const { username, password } = state;
  const [errors, setErrors] = useState({});

  const [login, { loading }] = useLazyQuery(LOGIN_USER, {
    onCompleted({ login }) {
      dispatch({ type: "LOGIN", payload: login });
      history.push("/");
    },
    onError(err) {
      console.log({ err });
      console.log({ loginError: err.graphQLErrors[0].extensions.error });

      const error = err.graphQLErrors[0].extensions.error;
      setErrors({ username: error, password: error });
    },
  });

  const handleSubmit = e => {
    e.preventDefault();

    let errors = {};
    if (!username) {
      errors.username = "Username is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length) {
      return setErrors(errors);
    }

    login({ variables: state });
  };

  const handleOnChange = e => {
    setState({ ...state, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <Row className="py-4 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Login</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label className={errors.username && "text-danger"}>
              {errors.username ?? "Username"}
            </Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              onChange={handleOnChange}
              value={username}
              className={errors.username && "is-invalid"}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className={errors.password && "text-danger"}>
              {errors.password ?? "Password"}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleOnChange}
              value={password}
              className={errors.password && "is-invalid"}
            />
          </Form.Group>

          <Button variant="success" type="submit" disabled={loading}>
            {loading ? "Loading" : "Login"}
          </Button>
          <small>
            Don't have an account? <Link to="/register">Register</Link>
          </small>
        </Form>
      </Col>
    </Row>
  );
}
