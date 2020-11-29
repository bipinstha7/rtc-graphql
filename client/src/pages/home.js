import { Row } from "react-bootstrap";

import Users from "components/home/users";
import Messages from "components/home/messages";

export default function Home() {
  return (
    <Row className="mt-5">
      <Users />
      <Messages />
    </Row>
  );
}
