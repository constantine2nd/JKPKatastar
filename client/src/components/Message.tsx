import React, { ReactNode } from "react";
import { Alert } from "react-bootstrap";
import "./Message.css";

interface MessageProps {
  variant: string;
  children: ReactNode;
}

const Message: React.FC<MessageProps> = ({ variant, children }) => {
  return (
    <Alert variant={variant} className="message">
      {children}
    </Alert>
  );
};

Message.defaultProps = {
  variant: "info",
};

export default Message;
