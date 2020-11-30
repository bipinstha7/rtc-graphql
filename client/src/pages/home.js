import { useEffect } from "react";
import { Row } from "react-bootstrap";
import { useSubscription, gql } from "@apollo/client";

import Users from "components/home/users";
import Messages from "components/home/messages";
import { GET_MESSAGES } from "components/home/messages";
import { useMessageDispatch, useMessageState } from "context/message";
import { useAuthState } from "context/auth";
import { client } from "ApolloProvider";

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      id
      content
      message {
        id
        from
        to
      }
    }
  }
`;

export default function Home() {
  const { user } = useAuthState();
  const { selectedUser } = useMessageState();
  const dispatch = useMessageDispatch();
  const { data, error } = useSubscription(NEW_MESSAGE);
  const { data: reactionData, error: reactionError } = useSubscription(
    NEW_REACTION
  );

  useEffect(() => {
    if (error) {
      console.log({ useSubscriptionError: error });
    }

    if (data) {
      const message = data.newMessage;
      const otherUser =
        user.username === message.to ? message.from : message.to;

      dispatch({
        type: "ADD_MESSAGE",
        payload: { username: otherUser, message },
      });

      /* Update cache */
      const cacheData = client.readQuery({
        query: GET_MESSAGES,
        variables: {
          from: selectedUser,
        },
      });

      if (cacheData) {
        client.writeQuery({
          query: GET_MESSAGES,
          variables: {
            from: selectedUser,
          },
          data: {
            getMessages: [message, ...cacheData.getMessages],
          },
        });
      }
    }
  }, [data, dispatch, error, selectedUser, user.username]);

  useEffect(() => {
    if (error) {
      console.log({ useSubscriptionReactionError: error });
    }

    if (reactionData) {
      const reaction = reactionData.newReaction;
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to;

      dispatch({
        type: "ADD_REACTION",
        payload: { username: otherUser, reaction },
      });

      /* Update cache */
      const cacheData = client.readQuery({
        query: GET_MESSAGES,
        variables: {
          from: selectedUser,
        },
      });

      if (cacheData) {
        client.writeQuery({
          query: GET_MESSAGES,
          variables: {
            from: selectedUser,
          },
          data: {
            getMessages: [message, ...cacheData.getMessages],
          },
        });
      }
    }
  }, [dispatch, error, reactionData, selectedUser, user.username]);

  return (
    <Row className="mt-5">
      <Users />
      <Messages />
    </Row>
  );
}
