import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import { gql, useMutation } from "@apollo/client";

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirm_password: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirm_password: $confirm_password
    ) {
      username
      email
      createdAt
    }
  }
`;

export default function Register() {
  const history = useHistory();
  const [state, setState] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });
  const { email, username, password, confirm_password } = state;
  const [errors, setErrors] = useState({});

  const [register, { loading }] = useMutation(REGISTER_USER, {
    onCompleted() {
      history.push("/login");
    },
    update(_, res) {
      console.log({ res });
    },
    onError(err) {
      console.log({ err });
      console.log({ useMutaionError: err.graphQLErrors[0].extensions.errors });

      setErrors(err.graphQLErrors[0].extensions.errors);
    },
  });

  const handleSubmit = e => {
    e.preventDefault();

    let errors = {};
    if (!email) {
      errors.email = "Email is required";
    }
    if (!username) {
      errors.username = "Username is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    if (!confirm_password) {
      errors.confirm_password = "Confirm password is required";
    }

    if (Object.keys(errors).length) {
      return setErrors(errors);
    }

    register({ variables: state });
  };

  const handleOnChange = e => {
    setState({ ...state, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <Row className="py-4 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Register</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label className={errors.email && "text-danger"}>
              {errors.email ?? "Email address"}
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              onChange={handleOnChange}
              value={email}
              className={errors.email && "is-invalid"}
            />
          </Form.Group>
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
          <Form.Group>
            <Form.Label className={errors.confirm_password && "text-danger"}>
              {errors.confirm_password ?? "Confirm Password"}
            </Form.Label>
            <Form.Control
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              onChange={handleOnChange}
              value={confirm_password}
              className={errors.confirm_password && "is-invalid"}
            />
          </Form.Group>

          <Button variant="success" type="submit" disabled={loading}>
            {loading ? "Loading" : "Register"}
          </Button>
        </Form>
      </Col>
    </Row>
  );
}
