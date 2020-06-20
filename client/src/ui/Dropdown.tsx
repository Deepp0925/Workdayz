import React, { PureComponent } from "react";

class Dropdown extends PureComponent<
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >
> {
  render() {
    return (
      <select
        {...this.props}
        className="mt-2 block appearance-none w-full md:w-1/3 lg:w-64 bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none"
      >
        {this.props.children}
      </select>
    );
  }
}

export default Dropdown;
