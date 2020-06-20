import React, { Component } from "react";
import { StatusTypes, statusOpts } from "../shared";
import _ from "underscore";
import { Phase } from "../store/phase";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../store/projectInView";
import { User } from "../store/user";

interface IMemberOptions {
  userId: string;
}

class MembersOptions extends Component<IMemberOptions> {
  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;

  render() {
    const members = Array.from(this.context.members.values());
    members.splice(
      members.findIndex((member) => member.userId === this.props.userId),
      1
    );

    return (
      <React.Fragment>
        <option value={this.props.userId} key={this.props.userId}>
          {this.context.members.get(this.props.userId)?.fullName}
        </option>
        {members.map((member) => {
          return (
            <React.Fragment>
              <option value={member.userId} key={member.userId}>
                {this.context.members.get(this.props.userId)?.fullName}
              </option>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

export default MembersOptions;
