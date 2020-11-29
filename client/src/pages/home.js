import { gql, useQuery } from "@apollo/client";
import { Col, Row } from "react-bootstrap";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      email
      createdAt
    }
  }
`;

export default function Home() {
  const { loading, data, error } = useQuery(GET_USERS);

  if (error) {
    console.log({ error });
  }

  if (data) {
    console.log({ data });
  }

  let usersMarkup;
  if (!data || loading) {
    return <p>Loading...</p>;
  } else if (!data.getUsers.length) {
    usersMarkup = <p>No users have joined yet</p>;
  } else if (data.getUsers.length) {
    usersMarkup = data.getUsers.map(user => (
      <div key={user.username}>
        <p>{user.username}</p>
      </div>
    ));
  }

  return (
    <Row className="mt-5">
      <Col xs={4}>{usersMarkup}</Col>
      <Col xs={8}>
        <p>Messages</p>
      </Col>
    </Row>
  );
}
