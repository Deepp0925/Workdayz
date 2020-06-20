import React from "react";
import "./styles/app.scss";
import Session from "./pages/session";
import { BrowserRouter } from "react-router-dom";
import Loader from "./Loader";
import Store from "./store";
import { SessionContext } from "./store/session";
import Home from "./pages/home";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000";
const Routes: React.FC = () => {
  const isLoggedIn = React.useContext(SessionContext).isLoggedIn;
  return <React.Fragment>{isLoggedIn ? <Home /> : <Session />}</React.Fragment>;
};

const App: React.FC = () => {
  return (
    <Store>
      <Loader />
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Store>
  );
};

export default App;
