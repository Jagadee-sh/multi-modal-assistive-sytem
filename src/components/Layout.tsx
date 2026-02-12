import { Link, useLocation } from "react-router-dom";
import { Hand, Radio, Mic, LayoutDashboard, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/sign-language", label: "Sign Language", icon: Hand, color: "text-sign-language" },
  { path: "/morse-code", label: "Morse Code", icon: Radio, color: "text-morse-code" },
  { path: "/lip-reading", label: "Lip Reading", icon: Mic, color: "text-lip-reading" },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Hand className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">MMACS</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", item.color)} />
                {item.label}
              </Link>
            ))}
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
