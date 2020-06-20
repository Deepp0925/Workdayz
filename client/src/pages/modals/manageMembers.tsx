import React, { Component } from "react";
import Modal from "../../ui/Modal";
import {
  IProjectInViewContext,
  ProjectInViewContext,
} from "../../store/projectInView";
import { Member } from "../../store/member";
import { Feather } from "react-web-vector-icons";
import ManagementModals from ".";
import { defaultProfileImg, IOtherUsers, Response } from "../../shared";
import axios from "axios";
import { User } from "../../store/user";
import Loader from "../../Loader";
interface IManageMembersState {
  isOpen: boolean;
  isSearching: boolean;
}
export class ManageMembers extends Component<{}, IManageMembersState> {
  context!: IProjectInViewContext;
  static contextType = ProjectInViewContext;

  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      isSearching: false,
    };
  }

  private search: string = "";

  private users: IOtherUsers[] = [];

  private handleSearch = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const search = evt.currentTarget.value.trim();
      this.search = search;

      if (search) {
        const response = await axios.get<Response<IOtherUsers[]>>(
          `/users/search/${this.search}`
        );
        if (response.data.error) throw response.data.data;

        this.users = response.data.data;
      }

      this.setState({
        isSearching: !!search,
      });
    } catch (error) {
      console.log("error searching user", error);
    }
  };

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  remove = async (member: Member) => {
    try {
      await member.remove();
      this.context.removeMember(member.userId);
    } catch (error) {
      console.log("error removing member", error);
    }
  };

  add = async (member: IOtherUsers) => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(
        `/projects/member/add`,
        {
          userId: User.info?.userId,
          projectId: this.context.projectId,
          memberId: member.userId,
        },
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error adding", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      return true;
    } catch (error) {
      console.log(error);
      Loader.hide();
      console.log("an error occurred while adding member", error);
    }
  };

  private searchUsers = () => {
    try {
      return this.users.map((member: IOtherUsers) => {
        const isAlreadyMember = this.context.members.has(member._id!);
        member.userId = member._id!;
        console.log(isAlreadyMember, member);
        return (
          <div
            key={member._id}
            className="h-16 mt-2 rounded-lg flex p-2 items-center"
          >
            <div className="h-12 w-12">
              <img
                src={member.img || defaultProfileImg}
                className="object-cover w-full rounded-full"
                alt="member profile picture"
              />
            </div>
            <span className="flex flex-1 ml-2">{member.fullName}</span>
            {
              /**
               * is a member and a creator
               */
              isAlreadyMember && this.context.isCreator ? (
                <button
                  className="ml-2 w-12 h-12 bg-white text-error rounded-lg focus:outline-none"
                  onClick={
                    this.remove.bind(
                      null,
                      new Member(member, this.context.projectId)
                    ) as any
                  }
                >
                  <Feather name="trash-2" size={20} color="#e74c3c" />
                </button>
              ) : null
            }

            {
              /**
               * not a member
               */
              !isAlreadyMember ? (
                <button
                  className="ml-2 w-12 h-12 bg-white text-error rounded-lg focus:outline-none"
                  onClick={this.add.bind(null, member) as any}
                >
                  <Feather name="user-plus" size={20} color="#3489db" />
                </button>
              ) : null
            }
          </div>
        );
      });
    } catch (error) {
      console.log("error fetching users", error);
    }
  };

  private renderMembers = () => {
    return Array.from<Member>(this.context.members.values()).map(
      (member: Member) => (
        <div
          key={member.userId}
          className="h-16 mt-2 rounded-lg flex p-2 items-center"
        >
          <div className="h-12 w-12">
            <img
              src={member.img || defaultProfileImg}
              className="object-cover w-full rounded-full"
              alt="member profile picture"
            />
          </div>
          <span className="flex flex-1 ml-2">{member.fullName}</span>
          {
            /**
             * only the creator can remove a member
             */
            this.context.isCreator && member.userId !== User.info?.userId ? (
              <button
                className="ml-2 w-12 h-12 bg-white text-error rounded-lg focus:outline-none"
                onClick={this.remove.bind(null, member) as any}
              >
                <Feather name="trash-2" size={20} color="#e74c3c" />
              </button>
            ) : null
          }
        </div>
      )
    );
  };

  render() {
    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
            <span className="text-2xl font-semibold">Manage Members</span>
            <input
              placeholder="Search for members, skills, job titles..."
              defaultValue={this.search}
              onChange={this.handleSearch}
              className="py-3 px-2 rounded-lg bg-gray-200 my-4"
            />
            {this.state.isSearching ? this.searchUsers() : this.renderMembers()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default ManageMembers;
