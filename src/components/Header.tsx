import { Bell, Settings } from "lucide-react";

interface HeaderProps {
  userName: string;
  notifications?: number;
}

const Header = ({ userName, notifications = 0 }: HeaderProps) => {
  return (
    <header className="relative z-10 px-6 pt-12 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-foreground/80">Bem-vindo de volta,</p>
          <h1 className="text-xl font-bold text-primary-foreground">{userName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform active:scale-95">
            <Bell className="h-5 w-5 text-primary-foreground" />
            {notifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform active:scale-95">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
