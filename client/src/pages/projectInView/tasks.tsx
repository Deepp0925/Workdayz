import React, { Component } from "react";
import { Phase } from "../../store/phase";
import { Task } from "../../store/task";
import { statusColor } from "../../utils/color";

interface ITasksProps {
  phase: Phase;
}

class Tasks extends Component<ITasksProps> {
  render() {
    if (this.props.phase)
      return Array.from<Task>(this.props.phase.tasks() || ([] as any)).map(
        (task: Task) => {
          const status = task.status;
          return (
            <div className="task flex-1 flex flex-col" key={task.taskId}>
              <span className="projectName mb-2 text-lg font-semibold">
                {task.name}
              </span>
              <span className="projectDescription flex h-32 mb-2 overflow-y-scroll hideScrollBar">
                {task.description}
              </span>
            </div>
          );
        }
      );
    // don;t return any thing if no phase in view
    else return null;
  }
}

export default Tasks;
