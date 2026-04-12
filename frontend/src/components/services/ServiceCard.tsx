import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: number;
  isAdded: boolean;
  onToggle: () => void;
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  price,
  isAdded,
  onToggle,
}: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "transition-colors",
          isAdded && "border-primary bg-primary/5"
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                isAdded
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                {isAdded && (
                  <Badge variant="success">{t("booking.services.added")}</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {price === 0 ? t("common.price") : formatCurrency(price)}
          </span>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={isAdded ? "outline" : "default"}
              size="sm"
              onClick={onToggle}
            >
              {isAdded ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  {t("common.remove")}
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  {t("common.add")}
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
