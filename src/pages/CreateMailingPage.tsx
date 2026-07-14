import { CreateMailingForm } from "@/features/mailings/components/CreateMailingForm";

export function CreateMailingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Новая рассылка
        </h1>
        <p className="text-sm text-muted-foreground">
          Укажите провайдера и одно или несколько SMS-сообщений
        </p>
      </div>

      <CreateMailingForm />
    </div>
  );
}
