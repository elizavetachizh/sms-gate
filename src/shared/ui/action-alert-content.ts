import {
  AlertCircleIcon,
  CheckCircle2Icon,
  PencilIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { alertVariants } from "@/shared/ui/alert";

export type ActionAlertType = "created" | "updated" | "deleted" | "error";

export type ActionAlertEntity =
  | "message"
  | "mailing"
  | "template"
  | "provider"
  | "user";

const ENTITY_MESSAGES: Record<
  ActionAlertEntity,
  Record<Exclude<ActionAlertType, "error">, string>
> = {
  message: {
    created: "Сообщение добавлено",
    updated: "Сообщение обновлено",
    deleted: "Сообщение удалено",
  },
  mailing: {
    created: "Рассылка создана",
    updated: "Рассылка обновлена",
    deleted: "Рассылка удалена",
  },
  template: {
    created: "Шаблон создан",
    updated: "Шаблон обновлён",
    deleted: "Шаблон удалён",
  },
  provider: {
    created: "Провайдер добавлен",
    updated: "Провайдер обновлён",
    deleted: "Провайдер удалён",
  },
  user: {
    created: "Пользователь создан",
    updated: "Пользователь обновлён",
    deleted: "Пользователь удалён",
  },
};

const ACTION_TITLES: Record<ActionAlertType, string> = {
  created: "Создано",
  updated: "Сохранено",
  deleted: "Удалено",
  error: "Ошибка",
};

const ACTION_VARIANTS: Record<
  ActionAlertType,
  NonNullable<VariantProps<typeof alertVariants>["variant"]>
> = {
  created: "success",
  updated: "success",
  deleted: "success",
  error: "destructive",
};

const ACTION_ICONS: Record<ActionAlertType, LucideIcon> = {
  created: CheckCircle2Icon,
  updated: PencilIcon,
  deleted: Trash2Icon,
  error: AlertCircleIcon,
};

export interface ActionAlertContent {
  variant: NonNullable<VariantProps<typeof alertVariants>["variant"]>;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function getActionAlertContent(
  action: ActionAlertType,
  options?: {
    entity?: ActionAlertEntity;
    message?: string;
  },
): ActionAlertContent {
  const entity = options?.entity ?? "message";

  if (action === "error") {
    return {
      variant: "destructive",
      title: ACTION_TITLES.error,
      description: options?.message ?? "Не удалось выполнить операцию",
      icon: ACTION_ICONS.error,
    };
  }

  return {
    variant: ACTION_VARIANTS[action] ?? "default",
    title: ACTION_TITLES[action],
    description: options?.message ?? ENTITY_MESSAGES[entity][action],
    icon: ACTION_ICONS[action],
  };
}
