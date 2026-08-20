import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { isValidationError, type UserRead } from "@/shared/api";
import {
  applyValidationErrors,
  mapValidationErrors,
} from "@/shared/api/map-validation-errors";
import { getMutationErrorMessage } from "@/shared/lib/mutation-error";
import { Button } from "@/shared/ui/button";
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
import { useUpdateUser } from "../hooks/useUpdateUser";
import {
  userChangePasswordFormSchema,
  type UserChangePasswordFormValues,
} from "../schemas/user.schema";

interface ChangePasswordDialogProps {
  user: UserRead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function ChangePasswordDialogForm({
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
    setError,
    formState: { errors },
  } = useForm<UserChangePasswordFormValues>({
    resolver: zodResolver(userChangePasswordFormSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: UserChangePasswordFormValues) {
    setSubmitError(null);

    try {
      await updateUser.mutateAsync({ password: values.password });
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
        getMutationErrorMessage(error, "Не удалось сменить пароль"),
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="change-user-password">
          Новый пароль <span className="text-destructive">*</span>
        </Label>
        <Input
          id="change-user-password"
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
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending && <Loader2Icon className="animate-spin" />}
          Сохранить
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ChangePasswordDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {user && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сменить пароль</DialogTitle>
            <DialogDescription>
              Новый пароль для {user.email}. Минимум 8 символов.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <ChangePasswordDialogForm
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
