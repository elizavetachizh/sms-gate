import { useState } from "react";
import { type ActionAlertType } from "../ui/action-alert";

export function useActionAlert() {
  const [actionAlert, setActionAlert] = useState<{
    action: ActionAlertType;
    message?: string;
  } | null>(null);
  return { actionAlert, setActionAlert };
}
