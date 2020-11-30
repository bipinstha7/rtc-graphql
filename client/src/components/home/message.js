import { useAuthState } from "context/auth";
import classnames from "classnames";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Dayjs from "dayjs";

export default function Message({ message }) {
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const received = !sent;

  return (
    <OverlayTrigger
      placement={sent ? "right" : "left"}
      overlay={
        <Tooltip>
          {Dayjs(message.createdAt).format("MMM DD, YYYY  h:mm a")}
        </Tooltip>
      }
    >
      <div
        className={classnames("d-flex my-3", {
          "ml-auto": sent,
          "mr-auto": received,
        })}
      >
        <div
          className={classnames("py-2 px-3 rounded-pill", {
            "bg-primary": sent,
            "bg-secondary": received,
          })}
        >
          <p className={classnames({ "text-white": sent })}>
            {message.content}
          </p>
        </div>
      </div>
    </OverlayTrigger>
  );
}
