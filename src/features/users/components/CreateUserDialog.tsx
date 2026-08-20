import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { isValidationError } from "@/shared/api";
import {
  applyValidationErrors,
  mapValidationErrors,
} from "@/shared/api/map-validation-errors";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useCreateUser } from "../hooks/useCreateUser";
import {
  defaultUserCreateFormValues,
  toUserCreatePayload,
  userCreateFormSchema,
  USER_ROLE_LABELS,
  type UserCreateFormValues,
} from "../schemas/user.schema";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function CreateUserDialogForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const createUser = useCreateUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    defaultValues: defaultUserCreateFormValues,
  });

  async function onSubmit(values: UserCreateFormValues) {
    setSubmitError(null);

    try {
      await createUser.mutateAsync(toUserCreatePayload(values));
      onClose();
      onSuccess?.();
    } catch (error) {
      if (isValidationError(error)) {
        applyValidationErrors(mapValidationErrors(error.details), setError);
        return;
      }

      setSubmitError(
        getMutationErrorMessage(error, "Не удалось создать пользователя"),
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="user-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="user-email"
          type="email"
          autoComplete="off"
          placeholder="user@example.com"
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-password">
          Пароль <span className="text-destructive">*</span>
        </Label>
        <Input
          id="user-password"
          type="password"
          autoComplete="new-password"
          placeholder="Не менее 8 символов"
          aria-required="true"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-name">
          Имя{" "}
          <span className="font-normal text-muted-foreground">
            (необязательно)
          </span>
        </Label>
        <Input
          id="user-name"
          placeholder="Иван Иванов"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name?.message && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-role">
          Роль{" "}
          <span className="font-normal text-muted-foreground">
            (необязательно)
          </span>
        </Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Пользователь" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{USER_ROLE_LABELS.user}</SelectItem>
                <SelectItem value="admin">{USER_ROLE_LABELS.admin}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="user-is-active"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            <Label htmlFor="user-is-active">Активен</Label>
          </div>
        )}
      />

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={createUser.isPending}
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending && <Loader2Icon className="animate-spin" />}
          Создать
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
          <DialogDescription>
            Поля со звёздочкой обязательны. Роль и статус можно оставить по
            умолчанию.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <CreateUserDialogForm
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
