import { useTheme } from "@/hooks/useTheme";

export function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer className="glass border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <img src={theme === "light" ? "/logolcb.png" : "/logolc.png"} alt="Linda Casa Logo" className="h-5 w-auto object-contain" />
          <span>Gestão de estoque</span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span>Shopping Praça Nova</span>
          <span>Camobi</span>
        </div>
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Linda Casa. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
