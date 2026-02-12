'use client';

import { LucideIcon, Loader2, FileText } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/lib/components/ui/tooltip';

interface BotonReporteProps {
  onClick: () => Promise<void>;
  loading: boolean;
  label: string;
  tooltip?: string;
  variant?: "ghost" | "outline" | "default" | "destructive";
  className?: string;
  icon?: LucideIcon;
  showText?: boolean;
  disabled?: boolean;
}

export const BotonReporte = ({
  onClick,
  loading,
  label,
  tooltip,
  variant = "outline",
  className = "",
  icon: Icon = FileText,
  showText = true,
  disabled = false,
}: BotonReporteProps) => {
  
  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onClick();
  };

  const buttonElement = (
    <Button
      onClick={handleAction}
      disabled={loading || disabled}
      variant={variant}
      className={`cursor-pointer transition-all duration-200 ${className}`}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${showText ? 'mr-2' : ''} h-4 w-4`} />
      ) : (
        <Icon className={`${showText ? 'mr-2' : ''} h-4 w-4`} />
      )}
      {showText && (loading ? "Generando..." : label)}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonElement;
};