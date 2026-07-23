import { CreateMailingForm } from "@/features/mailings/components/CreateMailingForm";

export function CreateMailingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Новая рассылка
        </h1>
        <p className="text-sm text-muted-foreground">
          Укажите провайдера, режим отправки и получателей
        </p>
      </div>

      <CreateMailingForm />
    </div>
  );
}
