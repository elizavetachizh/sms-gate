import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { isValidationError, type UserRead } from "@/shared/api";
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
import { useUpdateUser } from "../hooks/useUpdateUser";
import { buildUserUpdatePayload, toUserEditFormValues } from "../lib/user-update";
import {
  userEditFormSchema,
  USER_ROLE_LABELS,
  type UserEditFormValues,
} from "../schemas/user.schema";

interface EditUserDialogProps {
  user: UserRead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function EditUserDialogForm({
  user,
  onClose,
  onSuccess,
}: {
  user: UserRead;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const updateUser = useUpdateUser(user.id);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: toUserEditFormValues(user),
  });

  async function onSubmit(values: UserEditFormValues) {
    setSubmitError(null);

    const payload = buildUserUpdatePayload(values, user);
    if (!payload) {
      onClose();
      return;
    }

    try {
      await updateUser.mutateAsync(payload);
      onClose();
      onSuccess?.();
    } catch (error) {
      if (isValidationError(error)) {
        if (error.detailMessage) {
          setSubmitError(error.detailMessage);
          return;
        }
        applyValidationErrors(mapValidationErrors(error.details), setError);
        return;
      }

      setSubmitError(
        getMutationErrorMessage(error, "Не удалось сохранить пользователя"),
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="edit-user-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-user-email"
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
        <Label htmlFor="edit-user-password">
          Новый пароль{" "}
          <span className="font-normal text-muted-foreground">
            (необязательно)
          </span>
        </Label>
        <Input
          id="edit-user-password"
          type="password"
          autoComplete="new-password"
          placeholder="Оставьте пустым, если не меняете"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-user-name">
          Имя{" "}
          <span className="font-normal text-muted-foreground">
            (необязательно)
          </span>
        </Label>
        <Input
          id="edit-user-name"
          placeholder="Иван Иванов"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name?.message && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-user-role">Роль</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="edit-user-role">
                <SelectValue placeholder="Выберите роль" />
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
              id="edit-user-is-active"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            <Label htmlFor="edit-user-is-active">Активен</Label>
          </div>
        )}
      />

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={updateUser.isPending}
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={updateUser.isPending || !isDirty}>
          {updateUser.isPending && <Loader2Icon className="animate-spin" />}
          Сохранить
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить пользователя</DialogTitle>
          <DialogDescription>
            Обновите данные учётной записи. Пароль менять не обязательно.
          </DialogDescription>
        </DialogHeader>
        {open && user && (
          <EditUserDialogForm
            key={user.id}
            user={user}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
