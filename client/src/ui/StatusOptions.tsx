import React, { Component } from "react";
import { StatusTypes, statusOpts } from "../shared";
import _ from "underscore";
interface IStatusOptions {
  status: StatusTypes;
}
class StatusOptions extends Component<IStatusOptions> {
  render() {
    const myOptions = [...statusOpts];
    myOptions.splice(
      myOptions.findIndex((status) => status === this.props.status),
      1
    );
    return (
      <React.Fragment>
        <option value={this.props.status} key={this.props.status}>
          {this.props.status}
        </option>
        {myOptions.map((status) => (
          <option value={status} key={status}>
            {status}
          </option>
        ))}
      </React.Fragment>
    );
  }
}

export default StatusOptions;
