import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Luggage, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

const baggageSchema = z.object({
  type: z.enum(["CABIN", "CHECKED", "SPECIAL"]),
  weight: z.number().min(1, "Weight must be at least 1kg").max(50, "Max 50kg"),
  dimensions: z.string().min(1, "Dimensions are required"),
});

type BaggageFormData = z.infer<typeof baggageSchema>;

interface BaggageItem extends BaggageFormData {
  id: string;
  price: number;
}

const BAGGAGE_PRICES: Record<string, number> = {
  CABIN: 0,
  CHECKED: 25,
  SPECIAL: 50,
};

const EXTRA_KG_PRICE = 5;
const FREE_WEIGHTS: Record<string, number> = {
  CABIN: 10,
  CHECKED: 23,
  SPECIAL: 30,
};

interface BaggageServiceProps {
  onUpdate: (bags: BaggageItem[]) => void;
}

export function BaggageService({ onUpdate }: BaggageServiceProps) {
  const { t } = useTranslation();
  const [bags, setBags] = useState<BaggageItem[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BaggageFormData>({
    resolver: zodResolver(baggageSchema),
    defaultValues: {
      type: "CHECKED",
      weight: 23,
      dimensions: "55x40x20",
    },
  });

  const selectedType = watch("type");
  const selectedWeight = watch("weight");

  const calculatePrice = (type: string, weight: number): number => {
    const basePrice = BAGGAGE_PRICES[type] ?? 0;
    const freeWeight = FREE_WEIGHTS[type] ?? 0;
    const extraWeight = Math.max(0, weight - freeWeight);
    return basePrice + extraWeight * EXTRA_KG_PRICE;
  };

  const currentPrice = calculatePrice(selectedType, selectedWeight ?? 0);

  const addBag = (data: BaggageFormData) => {
    const price = calculatePrice(data.type, data.weight);
    const newBag: BaggageItem = {
      ...data,
      id: crypto.randomUUID(),
      price,
    };
    const updatedBags = [...bags, newBag];
    setBags(updatedBags);
    onUpdate(updatedBags);
    reset();
  };

  const removeBag = (id: string) => {
    const updatedBags = bags.filter((b) => b.id !== id);
    setBags(updatedBags);
    onUpdate(updatedBags);
  };

  const totalCharge = bags.reduce((sum, b) => sum + b.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Luggage className="h-5 w-5" />
            {t("services.baggage.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Bag Form */}
          <form
            onSubmit={handleSubmit(addBag)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <Label>{t("services.baggage.type")}</Label>
                <Select
                  defaultValue="CHECKED"
                  onValueChange={(value) =>
                    setValue("type", value as BaggageFormData["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CABIN">
                      {t("services.baggage.cabin")}
                    </SelectItem>
                    <SelectItem value="CHECKED">
                      {t("services.baggage.checked")}
                    </SelectItem>
                    <SelectItem value="SPECIAL">
                      {t("services.baggage.special")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">{t("services.baggage.weight")}</Label>
                <Input
                  id="weight"
                  type="number"
                  min={1}
                  max={50}
                  {...register("weight", { valueAsNumber: true })}
                  className={errors.weight ? "border-destructive" : ""}
                />
                {errors.weight && (
                  <p className="text-xs text-destructive">
                    {errors.weight.message}
                  </p>
                )}
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">
                  {t("services.baggage.dimensions")}
                </Label>
                <Input
                  id="dimensions"
                  placeholder="55x40x20"
                  {...register("dimensions")}
                  className={errors.dimensions ? "border-destructive" : ""}
                />
                {errors.dimensions && (
                  <p className="text-xs text-destructive">
                    {errors.dimensions.message}
                  </p>
                )}
              </div>
            </div>

            {/* Current Price Preview */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">
                {t("services.baggage.totalCharge")}
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(currentPrice)}
              </span>
            </div>

            <Button type="submit" variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("services.baggage.addBag")}
            </Button>
          </form>

          {/* Bag List */}
          {bags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <AnimatePresence>
                  {bags.map((bag) => (
                    <motion.div
                      key={bag.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Luggage className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {t(`services.baggage.${bag.type.toLowerCase()}`)}
                            </Badge>
                            <span className="text-sm">{bag.weight}kg</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bag.dimensions} cm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {formatCurrency(bag.price)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBag(bag.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </CardContent>

        {bags.length > 0 && (
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <span className="font-medium">{t("common.total")}</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(totalCharge)}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
