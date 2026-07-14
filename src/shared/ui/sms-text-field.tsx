import { forwardRef, type ReactNode } from "react";
import {
  SmsTextAnalysisSummary,
  SmsTextAnalysisWarnings,
} from "@/shared/sms";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

export interface SmsTextFieldProps extends Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "value"
> {
  label?: string;
  value?: string;
  error?: string;
  showAnalysis?: boolean;
  templatePicker?: ReactNode;
  fieldClassName?: string;
}

export const SmsTextField = forwardRef<HTMLTextAreaElement, SmsTextFieldProps>(
  function SmsTextField(
    {
      id,
      label = "Текст SMS",
      value = "",
      error,
      showAnalysis = true,
      templatePicker,
      className,
      fieldClassName,
      rows = 4,
      placeholder = "Текст сообщения",
      ...textareaProps
    },
    ref,
  ) {
    return (
      <div className={cn("space-y-2", fieldClassName)}>
        {templatePicker}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 items-center justify-between gap-2">
            <Label htmlFor={id}>{label}</Label>

            {showAnalysis && <SmsTextAnalysisSummary text={value} />}
          </div>
        </div>

        <Textarea
          ref={ref}
          id={id}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={className}
          {...textareaProps}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {showAnalysis && <SmsTextAnalysisWarnings text={value} />}
      </div>
    );
  },
);
