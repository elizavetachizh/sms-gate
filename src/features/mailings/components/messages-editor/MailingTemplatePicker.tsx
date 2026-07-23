import { TemplatePicker } from "@/features/templates/components/TemplatePicker";
import { useMailingTemplatePicker } from "@/features/mailings/components/messages-editor/useMailingTemplatePicker";

interface MailingTemplatePickerProps {
  id: string;
  hideWhenEmpty?: boolean;
  className?: string;
  onApplyText: (text: string) => void;
}

export function MailingTemplatePicker({
  id,
  hideWhenEmpty = false,
  className,
  onApplyText,
}: MailingTemplatePickerProps) {
  const {
    templates,
    isLoading,
    isError,
    selectedTemplateId,
    applyTemplate,
  } = useMailingTemplatePicker(onApplyText);

  if (hideWhenEmpty && templates.length === 0 && !isLoading && !isError) {
    return null;
  }

  return (
    <TemplatePicker
      id={id}
      label=""
      templates={templates}
      isLoading={isLoading}
      isError={isError}
      value={selectedTemplateId}
      onChange={applyTemplate}
      className={className}
    />
  );
}
