import React, { Component } from "react";
import "./styles/loader.scss";

const loaderRef: React.RefObject<HTMLDivElement> = React.createRef();

class Loader extends Component {
  static show = () => {
    loaderRef?.current?.classList?.add("show");
  };

  static hide = () => {
    loaderRef?.current?.classList?.remove("show");
  };

  render() {
    return <div className="loader" ref={loaderRef}></div>;
  }
}

export default Loader;
