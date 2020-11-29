import { gql, useQuery } from "@apollo/client";
import { Col, Image } from "react-bootstrap";
import classnames from "classnames";

import { useMessageDispatch, useMessageState } from "context/message";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      image_url
      createdAt
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

export default function Users() {
  const dispatch = useMessageDispatch();
  const { users, selectedUser } = useMessageState();

  const { loading } = useQuery(GET_USERS, {
    onCompleted: data =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),

    onError: err => console.log({ GET_USERS_QUERY_ERROR: err }),
  });

  const handleClick = username => {
    dispatch({ type: "SET_SELECTED_USER", payload: username });
  };

  let usersMarkup;
  if (!users || loading) {
    return <p>Loading...</p>;
  } else if (!users.length) {
    usersMarkup = <p>No users have joined yet</p>;
  } else if (users.length) {
    usersMarkup = users.map(user => (
      <div
        role="button"
        className={classnames("d-flex p-3 user-hover", {
          "bg-white": selectedUser === user.username,
        })}
        key={user.username}
        onClick={() => handleClick(user.username)}
      >
        <Image
          src={user.image_url}
          roundedCircle
          className="mr-2"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
        <div>
          <p className="text-success">{user.username}</p>
          <p className="font-weight-light" style={{ opacity: 0.3 }}>
            {user.latestMessage
              ? user.latestMessage.content
              : "You are now connected!"}
          </p>
        </div>
      </div>
    ));
  }

  return (
    <Col xs={4} className="p-0 bg-secondary">
      {usersMarkup}
    </Col>
  );
}
