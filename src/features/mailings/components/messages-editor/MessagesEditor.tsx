import { useFormContext, useWatch } from "react-hook-form";
import { DifferentTextEditor } from "@/features/mailings/components/messages-editor/DifferentTextEditor";
import { SameTextEditor } from "@/features/mailings/components/messages-editor/SameTextEditor";
import { TextModeSwitcher } from "@/features/mailings/components/messages-editor/TextModeSwitcher";
import { buildTextModeValues } from "@/features/mailings/components/messages-editor/lib";
import type {
  MailingReplaceFormValues,
  MailingTextMode,
} from "@/features/mailings/schemas/mailing.schema";

export function MessagesEditor() {
  const { control, getValues, setValue } =
    useFormContext<MailingReplaceFormValues>();
  const textMode = useWatch({ control, name: "text_mode" });

  function handleModeChange(nextMode: MailingTextMode) {
    if (nextMode === textMode) return;

    const { messages, shared_text: sharedText } = getValues();
    const nextValues = buildTextModeValues(nextMode, messages, sharedText);

    setValue("shared_text", nextValues.shared_text, { shouldValidate: false });
    setValue("messages", nextValues.messages, { shouldValidate: false });
    setValue("text_mode", nextMode, { shouldValidate: false });
  }

  return (
    <div className="space-y-6">
      <TextModeSwitcher textMode={textMode} onChange={handleModeChange} />

      <div className="rounded-lg border bg-muted/20 p-4 sm:p-5">
        {textMode === "same" ? <SameTextEditor /> : <DifferentTextEditor />}
      </div>
    </div>
  );
}
