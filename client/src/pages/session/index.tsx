import React from "react";
import "../../styles/session.scss";
import { Route, Redirect, Switch, NavLink } from "react-router-dom";
import Login from "../login";
import Register from "../register";
import { SessionContext } from "../../store/session";

interface IRoute {
  route: string;
  name: string;
}

const transition = {
  transitionDuration: "0.5s",
};
function SessionRouteBtn({ route, name }: IRoute) {
  return (
    <NavLink
      to={route}
      className="mr-5 font-medium pb-1 px-2 border-b-2 border-transparent"
      activeClassName="text-themeColor border-themeColor"
      style={transition}
    >
      {name}
    </NavLink>
  );
}

function ShowLoginOpts() {
  return (
    <React.Fragment>
      <div className="flex">
        <SessionRouteBtn route="/login" name="Login" />
        <SessionRouteBtn route="/register" name="Register" />
      </div>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Redirect to="/login" />
      </Switch>
    </React.Fragment>
  );
}

function Session() {
  const isLoggedIn = React.useContext(SessionContext).isLoggedIn;
  return (
    <div className="Session flex">
      <div className="LeftSection flex-none w-0 sm:flex-1 sm:flex">
        <img
          src="https://www.proofhub.com/wp-content/uploads/2018/04/10-Online-Project-Management-Courses-to-Accelerate-Career-Growth.jpg"
          className="object-cover"
          alt="cover"
        />
      </div>
      <div className="RightSection w-full sm:w-full md:w-1/2 lg:w-2/5 bg-white p-10 flex-column overflow-scroll">
        <h1 className="text-themeColor text-3xl font-semibold pb-4">
          Workdayz
        </h1>
        {!isLoggedIn ? <ShowLoginOpts /> : <Redirect to="/home" />}
      </div>
    </div>
  );
}

export default Session;
