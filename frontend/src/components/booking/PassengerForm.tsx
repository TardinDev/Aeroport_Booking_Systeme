import { useTranslation } from "react-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Passenger } from "@/types";

const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  passportNumber: z.string().optional(),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required"),
});

type FormData = z.infer<typeof formSchema>;

interface PassengerFormProps {
  initialPassengers?: Passenger[];
  maxPassengers: number;
  onSubmit: (passengers: Passenger[]) => void;
}

export function PassengerForm({
  initialPassengers = [],
  maxPassengers,
  onSubmit,
}: PassengerFormProps) {
  const { t } = useTranslation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers:
        initialPassengers.length > 0
          ? initialPassengers
          : [
              {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                passportNumber: "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data.passengers);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t("booking.passenger.title")}
        </h3>
        {fields.length < maxPassengers && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                passportNumber: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("booking.passenger.addPassenger")}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t("booking.passenger.passenger")} {index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      {t("booking.passenger.removePassenger")}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.firstName`}>
                      {t("booking.passenger.firstName")}
                    </Label>
                    <Input
                      id={`passengers.${index}.firstName`}
                      {...register(`passengers.${index}.firstName`)}
                      className={
                        errors.passengers?.[index]?.firstName
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.passengers?.[index]?.firstName && (
                      <p className="text-xs text-destructive">
                        {errors.passengers[index]?.firstName?.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.lastName`}>
                      {t("booking.passenger.lastName")}
                    </Label>
                    <Input
                      id={`passengers.${index}.lastName`}
                      {...register(`passengers.${index}.lastName`)}
                      className={
                        errors.passengers?.[index]?.lastName
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.passengers?.[index]?.lastName && (
                      <p className="text-xs text-destructive">
                        {errors.passengers[index]?.lastName?.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.email`}>
                      {t("booking.passenger.email")}
                    </Label>
                    <Input
                      id={`passengers.${index}.email`}
                      type="email"
                      {...register(`passengers.${index}.email`)}
                      className={
                        errors.passengers?.[index]?.email
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.passengers?.[index]?.email && (
                      <p className="text-xs text-destructive">
                        {errors.passengers[index]?.email?.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.phone`}>
                      {t("booking.passenger.phone")}
                    </Label>
                    <Input
                      id={`passengers.${index}.phone`}
                      type="tel"
                      {...register(`passengers.${index}.phone`)}
                      className={
                        errors.passengers?.[index]?.phone
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.passengers?.[index]?.phone && (
                      <p className="text-xs text-destructive">
                        {errors.passengers[index]?.phone?.message}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.dateOfBirth`}>
                      {t("booking.passenger.dateOfBirth")}
                    </Label>
                    <Input
                      id={`passengers.${index}.dateOfBirth`}
                      type="date"
                      {...register(`passengers.${index}.dateOfBirth`)}
                      className={
                        errors.passengers?.[index]?.dateOfBirth
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors.passengers?.[index]?.dateOfBirth && (
                      <p className="text-xs text-destructive">
                        {errors.passengers[index]?.dateOfBirth?.message}
                      </p>
                    )}
                  </div>

                  {/* Passport Number */}
                  <div className="space-y-2">
                    <Label htmlFor={`passengers.${index}.passportNumber`}>
                      {t("booking.passenger.passportNumber")}
                    </Label>
                    <Input
                      id={`passengers.${index}.passportNumber`}
                      {...register(`passengers.${index}.passportNumber`)}
                    />
                  </div>
                </div>

                {index < fields.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button type="submit" className="w-full">
        {t("common.next")}
      </Button>
    </form>
  );
}
