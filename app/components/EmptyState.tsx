import React from "react";

interface EmptyStateProps {
  iconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  message: string;
}

const EmptyState = ({ iconComponent: Icon, message }: EmptyStateProps) => {
  return (
    <div className="w-full h-full my-20 flex justify-center items-center flex-col">
      <div className="wiggle-animation">
        <Icon strokeWidth={1} className="w-30 h-30 text-primary" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;