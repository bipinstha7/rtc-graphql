import { useEffect } from "react";
import { Col } from "react-bootstrap";
import { gql, useLazyQuery } from "@apollo/client";

import Message from "./message";
import InputBox from "./inputbox";

import { useMessageDispatch, useMessageState } from "context/message";

export const GET_MESSAGES = gql`
  query getUsers($from: String!) {
    getMessages(from: $from) {
      uuid
      id
      from
      to
      content
      createdAt
      reactions {
        id
        content
      }
    }
  }
`;

export default function Messages() {
  const dispatch = useMessageDispatch();
  const { selectedUser, users } = useMessageState();

  const userIndex = users?.findIndex(u => u.username === selectedUser);
  const selectedUserMessage = users && users[userIndex]?.messages;

  console.log({
    selectedUserMessage: selectedUserMessage && selectedUserMessage.length,
  });

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

  let selectedChatMarkup;

  /* If we use cache */
  // const messages = data?.getMessages;

  // if (!selectedUser) {
  //   selectedChatMarkup = <p className="info-text">Select one of your friend</p>;
  // } else if (loading) {
  //   selectedChatMarkup = <p className="info-text">Loading...</p>;
  // } else if (!messages?.length && !loading) {
  //   selectedChatMarkup = <p className="info-text">Say Hi!</p>;
  // } else if (messages?.length) {
  //   selectedChatMarkup = messages.map((message, index) => (
  //     <div className="d-flex" key={message.uuid}>
  //       <Message message={message} />
  //       {index === messages.length - 1 ? (
  //         <div className="invisible">
  //           <hr className="m-0" />
  //         </div>
  //       ) : null}
  //     </div>
  //   ));
  // }

  if (!selectedUser) {
    selectedChatMarkup = <p className="info-text">Select one of your friend</p>;
  } else if (loading) {
    selectedChatMarkup = <p className="info-text">Loading...</p>;
  } else if (!selectedUserMessage?.length && !loading) {
    selectedChatMarkup = <p className="info-text">Say Hi!</p>;
  } else if (selectedUserMessage?.length) {
    selectedChatMarkup = selectedUserMessage.map((message, index) => (
      <div className="d-flex" key={message.uuid}>
        <Message message={message} />
        {index === selectedUserMessage.length - 1 ? (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        ) : null}
      </div>
    ));
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="message-box d-flex flex-column-reverse p-3">
        {selectedChatMarkup}
      </div>
      {selectedUser ? <InputBox /> : null}
    </Col>
  );
}
