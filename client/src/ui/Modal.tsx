import React, { PureComponent } from "react";
import RModal from "react-modal";

RModal.setAppElement("#root");

interface IModalProps {
  isOpen: boolean;
  onRequestClose: Function;
  contentLabel?: string;
  animationClassName?: string;
}

class Modal extends PureComponent<IModalProps> {
  render() {
    const animationClassName =
      this.props.animationClassName || "fade-in-bottom";
    return (
      <RModal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose as any}
        overlayClassName="fixed bg-black bg-opacity-75 h-full w-full"
        className={
          "fixed bg-white w-11/12 md:w-1/2 lg:w-5/12 modal outline-none  hideScrollBar overflow-y-scroll flex " +
          animationClassName
        }
        shouldCloseOnEsc
        shouldFocusAfterRender
        shouldCloseOnOverlayClick
        contentLabel={this.props.contentLabel}
      >
        {this.props.children}
      </RModal>
    );
  }
}

export default Modal;
