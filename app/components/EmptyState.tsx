import { Icon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  iconComponent: keyof typeof Icon;
  message: string;
}

const EmptyState = ({ iconComponent, message }: EmptyStateProps) => {
  const SelectedIcon = Icon[iconComponent];
  return (
    <div className="w-full h-full my-20 flex justify-center items-center flex-col">
      <div>
        <SelectedIcon strokeWith={1} className="w-30 h-30 text-primary" />
      </div>
      <p className="text-sm ">{message}</p>
    </div>
  );
};

export default EmptyState;
