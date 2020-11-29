import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import "./App.scss";
import Home from "pages/home";
import Login from "pages/login";
import Register from "pages/register";
import ApolloProvider from "ApolloProvider";

export default function App() {
  return (
    <ApolloProvider>
      <BrowserRouter>
        <Container>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </Container>
      </BrowserRouter>
    </ApolloProvider>
  );
}
