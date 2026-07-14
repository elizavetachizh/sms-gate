import { useState } from "react";
import type { ActionAlertEntity, ActionAlertType } from "../ui/action-alert";

export function useActionAlert() {
  const [actionAlert, setActionAlert] = useState<{
    action: ActionAlertType;
    entity?: ActionAlertEntity;
    message?: string;
  } | null>(null);
  return { actionAlert, setActionAlert };
}
