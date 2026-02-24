import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Produtos", path: "/produtos" },
  { label: "Entregas", path: "/entregas" },
  { label: "Vendas", path: "/vendas" },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay quando menu está aberto */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-40 backdrop-blur-lg md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-col items-center">
            <img src={theme === "light" ? "/logolcb.png" : "/logolc.png"} alt="Linda Casa Logo" className="h-10 w-auto object-contain" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Overlay com Glasmorfismo */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-16 z-50 md:hidden glass border-b shadow-lg animate-slide-down">
            <nav className="container flex flex-col gap-1 py-3 items-center px-4 sm:px-6">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent ${
                    location.pathname === item.path
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
