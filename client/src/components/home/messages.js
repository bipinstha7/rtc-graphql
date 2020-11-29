import { useEffect } from "react";
import { Col } from "react-bootstrap";
import { gql, useLazyQuery } from "@apollo/client";

import { useMessageDispatch, useMessageState } from "context/message";

const GET_MESSAGES = gql`
  query getUsers($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function Messages() {
  const dispatch = useMessageDispatch();
  const { selectedUser } = useMessageState();

  const [getMessages, { loading, data }] = useLazyQuery(GET_MESSAGES);

  useEffect(() => {
    if (selectedUser) {
      getMessages({ variables: { from: selectedUser } });
    }
  }, [getMessages, selectedUser]);

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: data.getMessages,
      });
    }
  }, [data, dispatch, selectedUser]);

  const messages = data?.getMessages;

  let selectedChatMarkup;
  if (!selectedUser) {
    selectedChatMarkup = <p>Select one of your friend</p>;
  } else if (loading) {
    selectedChatMarkup = <p>Loading...</p>;
  } else if (!messages?.length && !loading) {
    selectedChatMarkup = <p>Say Hi!</p>;
  } else if (messages?.length) {
    selectedChatMarkup = messages.map(message => (
      <p key={message.uuid}>{message.content}</p>
    ));
  }

  return <Col xs={8}>{selectedChatMarkup}</Col>;
}
