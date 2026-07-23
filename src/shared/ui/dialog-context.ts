import { createContext, useContext, type RefObject } from "react";

export interface DialogContextValue {
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  setHasDescription: (value: boolean) => void;
  portalContainerRef: RefObject<HTMLDialogElement | null>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogPortalContainer() {
  return useContext(DialogContext)?.portalContainerRef ?? null;
}
