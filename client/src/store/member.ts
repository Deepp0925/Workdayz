import { IOtherUsers, Response } from "../shared";
import Loader from "../Loader";
import axios from "axios";
import { User } from "./user";

export class Member {
  readonly fullName: string;
  readonly skills?: string;
  readonly description?: string;
  readonly jobTitle?: string;
  readonly img?: string | undefined;
  readonly userId: string;

  constructor(info: IOtherUsers, public readonly projectId: string) {
    this.fullName = info.fullName;
    this.userId = info.userId;
    this.skills = info.skills;
    this.jobTitle = info.jobTitle;
    this.img = info.img;
    this.description = info.description;
  }

  remove = async () => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(
        `/projects/member/remove`,
        {
          userId: User.info?.userId,
          projectId: this.projectId,
          memberId: this.userId,
        },
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error removing", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      return true;
    } catch (error) {
      console.log(error);
      Loader.hide();
      console.log("an error occurred while removing member", error);
      throw error;
    }
  };
}
