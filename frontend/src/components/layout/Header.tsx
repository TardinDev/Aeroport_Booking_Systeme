import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Moon,
  Sun,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { CurrencySelector } from "@/components/shared/CurrencySelector";

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
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

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/flights", label: t("nav.flights") },
    { to: "/transport", label: t("nav.transport") },
    { to: "/dashboard", label: t("nav.myBookings") },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full paper-bg transition-shadow duration-300",
        scrolled ? "border-b-2 border-ink shadow-sm" : "border-b border-ink/30"
      )}
    >
      {/* Top rule — editorial masthead flourish */}
      <div className="h-[3px] w-full bg-ink" />
      <div className="h-[1px] w-full bg-ink" />

      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* LEFT — Wordmark */}
          <Link
            to="/"
            className="group flex flex-col items-start focus-visible:outline-none"
          >
            <span className="display-serif text-3xl leading-none tracking-tight">
              <span className="display-serif-italic text-coral">Fly</span>
              <span className="text-ink-faded"> & </span>
              <span className="display-serif-italic">Taxi</span>
            </span>
            <span className="small-caps mt-1 text-[0.55rem] text-ink-faded">
              CHEAP FLIGHTS · DOOR-TO-DOOR · EST. MMXXVI
            </span>
          </Link>

          {/* CENTER — Sections nav (desktop only) */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "small-caps group relative py-2 transition-colors",
                    active ? "text-ink" : "text-ink-faded hover:text-ink"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-coral transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Actions */}
          <div className="hidden items-center gap-1 md:flex">
            <CurrencySelector />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-none text-ink hover:bg-ink/5"
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">Switch language</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-none text-ink hover:bg-ink/5"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <span className="mx-2 h-5 w-px bg-ink/30" />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="small-caps flex items-center gap-2 rounded-none text-ink hover:bg-ink/5"
                  >
                    <Avatar className="h-7 w-7 rounded-none border border-ink">
                      <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                      <AvatarFallback className="rounded-none bg-coral text-paper">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.firstName}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-none border-2 border-ink shadow-[4px_4px_0_0_var(--ink)]"
                >
                  <DropdownMenuLabel className="font-normal">
                    <p className="display-serif text-lg">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-ink-faded">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-ink/30" />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="small-caps rounded-none"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="small-caps rounded-none"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="small-caps rounded-none"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-ink/30" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="small-caps rounded-none text-postmark"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="small-caps rounded-none text-ink hover:bg-ink/5"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="small-caps rounded-none border-2 border-ink bg-ink text-paper shadow-[3px_3px_0_0_var(--coral)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--coral)]"
                >
                  {t("nav.register")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none text-ink md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="h-[1px] w-full bg-ink/80" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b-2 border-ink bg-paper md:hidden"
          >
            <div className="container mx-auto space-y-5 px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block display-serif text-3xl text-ink link-ink"
                >
                  {link.label}
                </Link>
              ))}

              <div className="rule-top flex flex-wrap items-center gap-3 pt-4">
                <CurrencySelector variant="editorial" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="small-caps rounded-none"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {i18n.language === "fr" ? "EN" : "FR"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="small-caps rounded-none"
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === "dark" ? "Light" : "Dark"}
                </Button>
              </div>

              {isAuthenticated && user ? (
                <div className="space-y-3 rule-top pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-none border-2 border-ink">
                      <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                      <AvatarFallback className="rounded-none bg-coral text-paper">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="display-serif text-lg">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-ink-faded">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="small-caps w-full rounded-none border-2 border-ink"
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("nav.dashboard")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="small-caps w-full rounded-none text-postmark"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rule-top pt-4">
                  <Button
                    variant="outline"
                    className="small-caps rounded-none border-2 border-ink"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t("nav.login")}
                  </Button>
                  <Button
                    className="small-caps rounded-none border-2 border-ink bg-ink text-paper shadow-[3px_3px_0_0_var(--coral)]"
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t("nav.register")}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
