import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
  ripple?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "md", ripple = true, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    };

    const baseStyles = `
      relative overflow-hidden
      transition-all duration-200 ease-out
      active:scale-[0.97] active:shadow-sm
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    `;

    const variants = {
      default: "bg-card text-card-foreground shadow-md hover:shadow-lg",
      primary: "gradient-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-95",
      secondary: "gradient-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:opacity-95",
      ghost: "bg-transparent hover:bg-muted",
      icon: "bg-card text-card-foreground shadow-md hover:shadow-lg rounded-full",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2.5 text-base rounded-xl",
      lg: "px-6 py-3 text-lg rounded-xl",
      icon: "h-12 w-12 rounded-full flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-primary-foreground/30 animate-pulse-ring pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
        {children}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
