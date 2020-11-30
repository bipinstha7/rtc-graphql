import { useState } from "react";
import { Form } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";

import { useMessageDispatch, useMessageState } from "context/message";
import { GET_MESSAGES } from "./messages";

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function InputBox() {
  const dispatch = useMessageDispatch();
  const { selectedUser } = useMessageState();
  const [content, setContent] = useState("");

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: err => console.log({ useMutationError: err }),
    // onCompleted: data =>
    //   dispatch({ type: "ADD_MESSAGE", payload: { message: data.sendMessage } }),
    // update(cache, { data: { sendMessage } }) {
    //   const cacheData = cache.readQuery({
    //     query: GET_MESSAGES,
    //     variables: {
    //       from: selectedUser,
    //     },
    //   });

    //   cache.writeQuery({
    //     query: GET_MESSAGES,
    //     variables: {
    //       from: selectedUser,
    //     },
    //     data: {
    //       getMessages: [sendMessage, ...cacheData.getMessages],
    //     },
    //   });
    // },
  });

  const submitMessage = e => {
    e.preventDefault();
    if (content.trim() === "") return;

    setContent("");

    sendMessage({ variables: { to: selectedUser, content } });
  };

  const handleInputChange = e => {
    setContent(e.target.value);
  };

  return (
    <Form onSubmit={submitMessage}>
      <Form.Group className="d-flex align-items-center">
        <Form.Control
          type="text"
          className="message-input-box p-4 rounded-pill bg-secondary border-0"
          placeholder="Type your message..."
          value={content}
          onChange={handleInputChange}
        ></Form.Control>
        <p className="text-primary ml-2" role="button" onClick={submitMessage}>
          Send
        </p>
      </Form.Group>
    </Form>
  );
}
