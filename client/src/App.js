import { Container } from "react-bootstrap";
import { BrowserRouter, Redirect, Switch } from "react-router-dom";

import "./App.scss";
import Home from "pages/home";
import Login from "pages/login";
import Register from "pages/register";
import ApolloProvider from "ApolloProvider";
import { AuthProvider } from "context/auth";
import { MessageProvider } from "context/message";
import ProtectedRoute from "utils/ProtectedRoute";
import Header from "components/header";

export default function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Header />
            <Container>
              <Switch>
                <ProtectedRoute exact path="/" component={Home} authenticated />
                <ProtectedRoute exact path="/register" component={Register} />
                <ProtectedRoute exact path="/login" component={Login} />
                <Redirect to="/login" />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
