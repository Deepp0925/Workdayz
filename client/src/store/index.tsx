import React, { PureComponent } from "react";
import { SessionStore } from "./session";
import { CurrentProjectsStore } from "./currentProjects";
import { PreviousProjectsStore } from "./previousProjects";

class Stores extends PureComponent {
  render() {
    return (
      <SessionStore>
        <CurrentProjectsStore>
          <PreviousProjectsStore>{this.props.children}</PreviousProjectsStore>
        </CurrentProjectsStore>
      </SessionStore>
    );
  }
}

export default Stores;
