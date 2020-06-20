export interface INewUser {
  fullName: string;
  email: string;
  skills: string;
  description: string;
  jobTitle: string;
  password: string;
}

export interface IUser extends Omit<INewUser, "password"> {
  token: string;
  img?: string;
  userId: string;
  _id?: string;
  __v?: number;
}

export interface IUpdateUser
  extends Partial<Omit<INewUser, "password" | "email">> {
  img?: string;
}

export type IOtherUsers = Omit<IUser, "email" | "token" | "password">;
export type ReasonTypes = "completed" | "cancelled";
export interface INewProject {
  userId: string;
  name: string;
  description: string;
}

export interface IPreviousProject extends INewProject {
  projectId: string;
  reason: ReasonTypes;
  closed: boolean;
  _id?: string;
}

export interface ICurrentProject extends Omit<IPreviousProject, "userId"> {
  progress?: number;
  userId: {
    _id: string;
    fullName: string;
  };
}

export interface INewPhase {
  name: string;
  projectId: string;
  userId: string;
}

export interface IPhase extends INewPhase {
  phaseId: string;
  status: StatusTypes;
  _id?: string;
}

export const statusOpts = [
  "in progress",
  "completed",
  "issue",
  "not completed",
];
export type StatusTypes =
  | "in progress"
  | "completed"
  | "issue"
  | "not completed";

export interface INewTask {
  name: string;
  phaseId: string;
  description: string;
  // assigned to
  assignedTo: string;
  // id of the person adding it
  userId: string;
  projectId: string;
}

export interface ITask extends Omit<INewTask, "userId" | "projectId"> {
  taskId: string;
  status: StatusTypes;
  _id?: string;
}

export interface Response<T = string> {
  error: boolean;
  data: T;
}

export const defaultProfileImg =
  "https://dentistry.ucsf.edu/sites/default/files/2017-11/default_profile_square_4.jpg";
