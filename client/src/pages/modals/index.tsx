import React, { Component } from "react";
import ManageMembers from "./manageMembers";
import PhaseManager, { ManagePhases } from "./managePhases";
import { ManageTasks } from "./manageTasks";
import NewPhase from "./newPhase";
import NewTask from "./newTasks";

class ManagementModals extends Component {
  static openNewPhase = () => {
    ManagementModals.newTaskRef.current?.closeModal();
    ManagementModals.managePhasesRef.current?.closeModal();
    ManagementModals.manageTasksRef.current?.closeModal();
    ManagementModals.managerMemberRef.current?.closeModal();
    ManagementModals.newPhaseref.current?.openModal();
  };

  static openNewTask = () => {
    ManagementModals.managerMemberRef.current?.closeModal();
    ManagementModals.managePhasesRef.current?.closeModal();
    ManagementModals.manageTasksRef.current?.closeModal();
    ManagementModals.newPhaseref.current?.closeModal();
    ManagementModals.newTaskRef.current?.openModal();
  };

  static openManageTasks = () => {
    ManagementModals.newTaskRef.current?.closeModal();
    ManagementModals.managePhasesRef.current?.closeModal();
    ManagementModals.managerMemberRef.current?.closeModal();
    ManagementModals.newPhaseref.current?.closeModal();
    ManagementModals.manageTasksRef.current?.openModal();
  };

  static openManagePhases = () => {
    ManagementModals.newTaskRef.current?.closeModal();
    ManagementModals.managerMemberRef.current?.closeModal();
    ManagementModals.manageTasksRef.current?.closeModal();
    ManagementModals.newPhaseref.current?.closeModal();
    ManagementModals.managePhasesRef.current?.openModal();
  };

  static openManageMembers = () => {
    ManagementModals.newTaskRef.current?.closeModal();
    ManagementModals.managePhasesRef.current?.closeModal();
    ManagementModals.manageTasksRef.current?.closeModal();
    ManagementModals.newPhaseref.current?.closeModal();
    ManagementModals.managerMemberRef.current?.openModal();
  };

  static managerMemberRef: React.RefObject<ManageMembers> = React.createRef();
  static managePhasesRef: React.RefObject<ManagePhases> = React.createRef();
  static manageTasksRef: React.RefObject<ManageTasks> = React.createRef();
  static newPhaseref: React.RefObject<NewPhase> = React.createRef();
  static newTaskRef: React.RefObject<NewTask> = React.createRef();

  render() {
    return (
      <React.Fragment>
        <ManageMembers ref={ManagementModals.managerMemberRef} />
        <PhaseManager ref={ManagementModals.managePhasesRef} />
        <ManageTasks ref={ManagementModals.manageTasksRef} />
        <NewPhase ref={ManagementModals.newPhaseref} />
        <NewTask ref={ManagementModals.newTaskRef} />
      </React.Fragment>
    );
  }
}

export default ManagementModals;
