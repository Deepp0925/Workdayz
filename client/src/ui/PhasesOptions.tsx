import React, { Component } from "react";
import { StatusTypes, statusOpts } from "../shared";
import _ from "underscore";
import { Phase } from "../store/phase";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../store/projectInView";
interface IPhasesOptions {
  phase: Phase;
}
class PhasesOptions extends Component<IPhasesOptions> {
  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;

  render() {
    const phases = Array.from(this.context.phases.values());
    phases.splice(
      phases.findIndex((phs) => phs.phaseId === this.props.phase.phaseId),
      1
    );

    return (
      <React.Fragment>
        <option value={this.props.phase.phaseId} key={this.props.phase.phaseId}>
          {this.props.phase.name}
        </option>
        {phases.map((phs) => {
          return (
            <React.Fragment>
              <option value={phs.phaseId} key={phs.phaseId}>
                {phs.name}
              </option>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

export default PhasesOptions;
