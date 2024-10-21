import { UncontrolledTooltip, ListGroup, ListGroupItem, PopoverBody } from "reactstrap";
import { isValid } from "date-fns";
import BlockUser from "../friends/BlockUser";
import { useState } from "react";

interface MessagePopoverProps {
  id: number;
  sendername: string;
  isUserSender: boolean;
  timestamp: string;
  roomID: string;
  sendGameInvite: (usernmae: string) => void;
}

export default function MessagePopover(props: MessagePopoverProps) {
  const [isModal, setIsModel] = useState<boolean>(false);

  const formatMessageTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (!isValid(date)) {
      return "Invalid date";
    }
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Australia/Adelaide",
    });
  };

  return (
    <>
      {isModal && <BlockUser username={props.sendername} roomID={props.roomID}></BlockUser>}
      {!props.isUserSender && (
        <UncontrolledTooltip autohide={false} placement="left" target={"ToolTip-" + props.id}>
          <small id={"Popover-usename" + props.id}>{props.sendername}</small>
        </UncontrolledTooltip>
      )}
      <UncontrolledTooltip
        // className="px-2 mx-2 bg-light"
        className="bg-white"
        autohide={false}
        // placement="right"
        placement={props.isUserSender ? "left" : "right"}
        target={"ToolTip-" + props.id}
        id={"Popover-" + props.id}
      >
        <PopoverBody className="text-light">
        <h2 className="bi bi-three-dots"></h2>
        </PopoverBody>


        <UncontrolledTooltip
          autohide={false}
          placement="top"
          target={"Popover-" + props.id}
        >
          <ListGroup className="p-0 m-0">
            <ListGroupItem className="border-bottom">{formatMessageTimestamp(props.timestamp)}</ListGroupItem>
            {!props.isUserSender && (
              <>
                <ListGroupItem
                  action
                  tag="button"
                  onClick={() => props.sendGameInvite(props.sendername)}
                  className="border-0"
                >
                  Challange 🏓
                </ListGroupItem>
                <ListGroupItem
                  action
                  tag="button"
                  className="border-0 text-danger"
                  onClick={() => setIsModel(true)}
                >
                  Block user
                </ListGroupItem>
              </>
            )}
          </ListGroup>
        </UncontrolledTooltip>
      </UncontrolledTooltip>
    </>
  );
}
