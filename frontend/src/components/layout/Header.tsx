import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { LanguageMenu } from "@/components/layout/LanguageMenu";

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/flights", label: t("nav.flights") },
    { to: "/transport", label: t("nav.beEscorted") },
    ...(isAuthenticated
      ? [{ to: "/dashboard", label: t("nav.myBookings") }]
      : []),
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300",
        scrolled || mobileMenuOpen ? "border-black/10" : "border-transparent"
      )}
    >
      <div className="content-wide flex h-12 items-center justify-between gap-6">
        <Link
          to="/"
          className="text-[19px] font-semibold tracking-tight text-foreground"
        >
          Fly &amp; taxi
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={cn(
                "text-[13px] transition-colors",
                isActive(link.to)
                  ? "text-foreground"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <CurrencySelector />
          <LanguageMenu compact />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group ml-2 inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-[13px] transition-colors hover:bg-foreground/5">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl} alt="" />
                    <AvatarFallback className="bg-secondary text-[11px] font-medium">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {user.firstName}
                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-[15px] font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="type-caption">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard />
                  {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 text-[13px] text-foreground/70 transition-colors hover:text-foreground"
              >
                {t("nav.login")}
              </Link>
              <Button size="sm" onClick={() => navigate("/register")}>
                {t("nav.register")}
              </Button>
            </>
          )}
        </div>

        <button
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? t("common.close") : t("nav.menu")}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden bg-background md:hidden"
          >
            <div className="content-wide pb-8 pt-4">
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-black/10 py-4 text-[28px] font-semibold tracking-tight"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex items-center gap-1">
                <CurrencySelector />
                <LanguageMenu />
              </div>

              {isAuthenticated && user ? (
                <div className="mt-6">
                  <p className="text-[15px] font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="type-caption">{user.email}</p>
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="secondary" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      {t("nav.login")}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      {t("nav.register")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
