import React from "react";
interface ITextInput
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  name: string;
  isDescription?: boolean;
}
export function TextInput(props: ITextInput) {
  const { isDescription, ...rest } = props;
  return (
    <div className="flex-column">
      <h5 className="mb-2">{props.name}</h5>
      {isDescription ? (
        <textarea
          {...(rest as any)}
          className="bg-gray-200 font-lg flex-1 w-full p-2 h-64 rounded-lg min-input-height"
        ></textarea>
      ) : (
        <input
          {...rest}
          className="bg-gray-200 font-lg flex-1 w-full p-2 rounded-lg"
        />
      )}
    </div>
  );
}
