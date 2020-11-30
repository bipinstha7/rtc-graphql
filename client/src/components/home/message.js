import { useState } from "react";
import { useAuthState } from "context/auth";
import classnames from "classnames";
import { Button, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import Dayjs from "dayjs";
import { gql, useMutation } from "@apollo/client";

const reactions = ["👍", "😆", "❤️", "😢", "😡"];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($id: Int!, $content: String!) {
    reactToMessage(id: $id, content: $content) {
      id
    }
  }
`;

export default function Message({ message }) {
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const received = !sent;

  const [showPopover, setShowPopover] = useState(false);

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: err => console.log({ reactToMessageError: err }),
    onCompleted: data => {
      console.log({ data });
      setShowPopover(false);
    },
  });

  console.log({ messsss: message });

  const react = reaction => {
    reactToMessage({ variables: { id: message.id, content: reaction } });
  };

  const reactionResults = [...new Set(message.reactions.map(r => r.content))];

  const reactButton = (
    <OverlayTrigger
      trigger="click"
      placement="top"
      show={showPopover}
      onToggle={setShowPopover}
      transition={false}
      rootClose
      overlay={
        <Popover className="rounded-pill">
          <Popover.Content className="d-flex align-items-center px-0 py-1 react-button-wrapper">
            {reactions.map(reaction => (
              <Button
                className="react-icon-button"
                variant="link"
                key={reaction}
                onClick={() => react(reaction)}
              >
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }
    >
      <Button variant="link" className="px-2">
        😆
      </Button>
    </OverlayTrigger>
  );

  return (
    <div
      className={classnames("d-flex my-3", {
        "ml-auto": sent,
        "mr-auto": received,
      })}
    >
      {sent ? reactButton : null}
      <OverlayTrigger
        placement={sent ? "right" : "left"}
        overlay={
          <Tooltip>
            {Dayjs(message.createdAt).format("MMM DD, YYYY  h:mm a")}
          </Tooltip>
        }
      >
        <div
          className={classnames("py-2 px-3 rounded-pill position-relative", {
            "bg-primary": sent,
            "bg-secondary": received,
          })}
        >
          {message.reactions ? (
            <div className="reaction-box bg-secondary p-1 rounded-pill">
              {reactionResults} {message.reactions.length}
            </div>
          ) : null}
          <p className={classnames({ "text-white": sent })}>
            {message.content}
          </p>
        </div>
      </OverlayTrigger>
      {received ? reactButton : null}
    </div>
  );
}
