import React, { Component } from "react";
import { Feather, AntDesign } from "react-web-vector-icons";
import { Switch, Route, Redirect, NavLink } from "react-router-dom";
import CurrentProjects from "../currentProjects";
import ProjectInView from "../projectInView";
import Profile from "../profile";
import { SessionContext } from "../../store/session";
import PreviousProjects from "../previousProjects";
import { ProjectInViewStore } from "../../store/projectInView";
import { CurrentProjectContext } from "../../store/currentProjects";
import ObjectId from "bson-objectid";

const profileRef: React.RefObject<Profile> = React.createRef();
const openProfile = () => {
  profileRef.current?.openModal();
};

export default function Home() {
  const sessionContext = React.useContext(SessionContext);
  const currentProjectsContext = React.useContext(CurrentProjectContext);

  return (
    <div className="flex flex-col flex-1 fixed h-full w-full z-0">
      <div className="h-16 w-full bg-white z-0">
        <div className="h-full flex px-3 sm:px-6 md:px-10">
          <div className="flex-1 flex">
            <NavLink
              to="/home"
              className="text-themeColor font-semibold text-3xl self-center"
            >
              Workdayz
            </NavLink>
          </div>

          <NavLink
            to="/home"
            className="w-16 sm:w-20 focus:outline-none self-center text-center"
          >
            <Feather name="home" color="#222" size={28} />
          </NavLink>

          <Profile ref={profileRef} />
          <button
            onClick={openProfile}
            className="w-16 sm:w-20 focus:outline-none self-center"
          >
            <Feather name="user" color="#222" size={28} />
          </button>
          <button
            onClick={sessionContext.logout}
            className="w-16 sm:w-20 focus:outline-none self-center"
          >
            <AntDesign name="logout" color="#222" size={28} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex-1 overflow-y-scroll px-3 sm:px-6 md:px-10">
        <Switch>
          <Route path="/home/current">
            <CurrentProjects />
          </Route>
          <Route path="/home/previous">
            <PreviousProjects />
          </Route>
          <Route
            path="/project/:projectId"
            render={({ match }) => {
              const projectId = match.params.projectId;
              if (ObjectId.isValid(projectId)) {
                const projectToSelect = currentProjectsContext.projects.get(
                  projectId
                );
                return (
                  <ProjectInViewStore
                    projectId={projectId}
                    {...projectToSelect}
                  >
                    <ProjectInView />
                  </ProjectInViewStore>
                );
              } else
                return (
                  <span className="flex flex-1 items-center">
                    Invalid Project
                  </span>
                );
            }}
          />

          <Redirect to="/home/current" />
        </Switch>
      </div>
    </div>
  );
}
