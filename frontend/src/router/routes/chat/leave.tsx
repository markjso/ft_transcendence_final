import { leaveroom } from "../../../apicalls/ApiMessages";
import { redirect } from "react-router-dom";
import type { Params } from "react-router-dom";

export async function action({ params }: { params: Params<"roomID"> }) {
  if (params.roomID) {
    await leaveroom(params.roomID);
    return redirect("/chat");
  }
}