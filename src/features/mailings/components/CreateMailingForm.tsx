import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { ArrowLeftIcon } from "lucide-react";
import { MessagesEditor } from "@/features/mailings/components/MessagesEditor";
import {
  useCreateMailing,
  isValidationError,
} from "@/features/mailings/hooks/useCreateMailing";
import {
  defaultMailingFormValues,
  mailingCreateSchema,
  type MailingCreateFormValues,
} from "@/features/mailings/schemas/mailing.schema";
import { useProviders } from "@/features/providers/hooks/useProviders";
import { defaultMailingsSearch } from "@/features/mailings/search";
import { applyCreateMailingValidationErrors } from "@/features/mailings/lib/mailing-api-errors";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

export function CreateMailingForm() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: providersData,
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useProviders();
  const createMailing = useCreateMailing();

  const form = useForm<MailingCreateFormValues>({
    resolver: zodResolver(mailingCreateSchema),
    defaultValues: defaultMailingFormValues,
  });

  const {
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors },
  } = form;

  const providerCode = useWatch({ control, name: "provider_code" });
  const providers = providersData?.items ?? [];

  useEffect(() => {
    if (!providerCode && providersData?.items?.length) {
      setValue("provider_code", providersData.items[0].code, {
        shouldValidate: true,
      });
    }
  }, [providerCode, providersData?.items, setValue]);

  async function onSubmit(values: MailingCreateFormValues) {
    setSubmitError(null);

    const messages =
      values.text_mode === "same"
        ? values.messages.map((message) => ({
            msisdn: message.msisdn,
            text: values.shared_text.trim(),
          }))
        : values.messages.map((message) => ({
            msisdn: message.msisdn,
            text: message.text.trim(),
          }));

    try {
      const mailing = await createMailing.mutateAsync({
        provider_code: values.provider_code,
        messages,
      });

      navigate({
        to: "/mailings/$mailingId",
        params: { mailingId: mailing.id },
      });
    } catch (error) {
      if (isValidationError(error)) {
        applyCreateMailingValidationErrors(error, setError);
        return;
      }

      setSubmitError(
        error instanceof Error ? error.message : "Не удалось создать рассылку",
      );
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Параметры рассылки</CardTitle>
            <CardDescription>
              Создание не отправляет SMS — отправка будет доступна на странице
              рассылки.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider_code">Провайдер</Label>

              {isProvidersLoading && (
                <Skeleton className="h-9 w-full max-w-xs" />
              )}

              {isProvidersError && (
                <p className="text-sm text-destructive">
                  Не удалось загрузить список провайдеров
                </p>
              )}

              {!isProvidersLoading &&
                !isProvidersError &&
                providers.length > 0 && (
                  <Select
                    value={providerCode}
                    onValueChange={(value) =>
                      setValue("provider_code", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="provider_code" className="max-w-xs">
                      <SelectValue placeholder="Выберите провайдера" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.code} value={provider.code}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

              {!isProvidersLoading &&
                !isProvidersError &&
                providers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Провайдеры не найдены
                  </p>
                )}

              {errors.provider_code?.message && (
                <p className="text-sm text-destructive">
                  {errors.provider_code.message}
                </p>
              )}
            </div>

            <MessagesEditor />
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" asChild>
              <Link to="/mailings" search={defaultMailingsSearch}>
                <ArrowLeftIcon />
                Назад к списку
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={
                createMailing.isPending ||
                isProvidersLoading ||
                providers.length === 0
              }
            >
              {createMailing.isPending ? "Создание…" : "Создать рассылку"}
            </Button>
          </CardFooter>
        </Card>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
      </form>
    </FormProvider>
  );
}
