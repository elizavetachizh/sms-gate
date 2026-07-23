import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { ArrowLeftIcon, InfoIcon } from "lucide-react";
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
import { buildMailingMessagesPayload } from "../lib/build-mailing-messages-payload";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
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

    const messages = buildMailingMessagesPayload(values);
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
          <CardHeader className="space-y-3">
            <CardTitle>Параметры рассылки</CardTitle>
            <div className="flex gap-2 rounded-md border border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                Создание не отправляет SMS — отправка будет доступна на странице
                рассылки.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="provider_code" className="text-sm font-medium">
                  Провайдер
                </Label>
                <p className="text-sm text-muted-foreground">
                  Выберите оператора, через которого будут отправлены сообщения
                </p>
              </div>

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
            </section>

            <div className="border-t" />

            <section className="space-y-1">
              <h2 className="text-sm font-medium">Сообщения и получатели</h2>
              <p className="text-sm text-muted-foreground">
                Выберите режим, затем заполните текст и номера
              </p>
              <div className="pt-4">
                <MessagesEditor />
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-6 sm:flex-row sm:justify-between">
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
