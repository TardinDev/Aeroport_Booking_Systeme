import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <div className="text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150, damping: 15 }}>
          <Plane className="mx-auto h-24 w-24 text-muted-foreground" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 text-7xl font-bold text-primary">
          404
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="mt-4 text-2xl font-semibold">{t("notFound.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("notFound.subtitle")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8">
          <Button size="lg" onClick={() => navigate("/")}><Home className="mr-2 h-4 w-4" />{t("notFound.backHome")}</Button>
        </motion.div>
      </div>
    </div>
  );
}
