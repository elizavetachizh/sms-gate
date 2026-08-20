import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMe } from "@/features/auth/hooks/useMe";
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
import {
  buildUserUpdatePayload,
  toUserEditFormValues,
} from "../lib/user-update";
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
  const { data: me } = useMe();
  const updateUser = useUpdateUser(user.id);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSelf = me?.id === user.id;

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

  const isActive = useWatch({ control, name: "is_active" });
  const willDeactivate = user.is_active && !isActive;

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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Доступ</h3>
        </div>

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="edit-user-is-active"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
                <Label htmlFor="edit-user-is-active">
                  Учётная запись активна
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Это не удаление: рассылки и шаблоны остаются.
              </p>
            </div>
          )}
        />

        {willDeactivate && (
          <p className="text-sm text-muted-foreground">
            {isSelf
              ? "Вы отключаете свою учётную запись. После сохранения войти снова не получится."
              : "После сохранения этот пользователь не сможет войти."}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Учётная запись</h3>

        <div className="space-y-2">
          <Label htmlFor="edit-user-email">Email</Label>
          <Input
            id="edit-user-email"
            type="email"
            autoComplete="off"
            placeholder="user@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <p className="text-sm text-muted-foreground">
            Логин для входа. Меняйте только если он указан с ошибкой.
          </p>
          {errors.email?.message && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-name">Имя</Label>
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
                  <SelectItem value="admin">
                    {USER_ROLE_LABELS.admin}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

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
      {user && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.name.trim() || user.email}</DialogTitle>
            <DialogDescription>
              Данные учётной записи. Пароль меняется отдельно.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <EditUserDialogForm
              key={user.id}
              user={user}
              onClose={() => onOpenChange(false)}
              onSuccess={onSuccess}
            />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
