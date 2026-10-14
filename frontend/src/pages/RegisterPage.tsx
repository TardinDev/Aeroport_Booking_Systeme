import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHoneypot } from "@/hooks/useHoneypot";
import { usePageMeta } from "@/hooks/usePageMeta";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("meta.register.title"), noindex: true });
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const termsAccepted = watch("terms");

  const honeypot = useHoneypot();

  const onSubmit = async (data: RegisterFormData) => {
    if (honeypot.isSpam()) return;
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      toast.success(t("common.success"));
      navigate("/dashboard");
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {t("auth.register.title")}
            </CardTitle>
            <CardDescription>{t("auth.register.subtitle")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...honeypot.fieldProps} />
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("auth.register.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {t("auth.validation.firstNameRequired")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("auth.register.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {t("auth.validation.lastNameRequired")}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.register.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  autoComplete="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {t("auth.validation.emailInvalid")}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.register.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  {...register("phone")}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("auth.register.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {t("auth.validation.passwordMin")}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.register.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword ? "border-destructive" : ""
                  }
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {t("auth.validation.passwordMatch")}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setValue("terms", checked === true)
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-5"
                >
                  {t("auth.register.termsParts.pre")}{" "}
                  <Link to="/terms" className="text-link hover:underline">
                    {t("auth.register.termsParts.terms")}
                  </Link>{" "}
                  {t("auth.register.termsParts.and")}{" "}
                  <Link to="/privacy" className="text-link hover:underline">
                    {t("auth.register.termsParts.privacy")}
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-xs text-destructive">
                  {t("auth.validation.termsRequired")}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("auth.register.registerButton")}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.register.hasAccount")}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {t("auth.register.signIn")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
