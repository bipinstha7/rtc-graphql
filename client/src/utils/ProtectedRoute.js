import { useAuthState } from "context/auth";
import { Redirect, Route } from "react-router-dom";

export default function ProtectedRoute(props) {
  const { user } = useAuthState();

  if (props.authenticated && user) {
    return <Route {...props} />;
  } else if (!props.authenticated && user) {
    return <Redirect to="/" />;
  } else if (props.authenticated && !user) {
    return <Redirect to="/login" />;
  } else {
    return <Route {...props} />;
  }
}
