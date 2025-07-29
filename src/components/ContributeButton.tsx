import { Button } from "@/components/ui/button";
import { DollarSign, Zap } from "lucide-react";
import { useState } from "react";

interface ContributeButtonProps {
  amount: number;
  onContribute: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ContributeButton({ 
  amount, 
  onContribute, 
  disabled = false, 
  className 
}: ContributeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleContribute = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onContribute();
    } catch (error) {
      console.error("Contribution failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContribute}
      disabled={disabled || isLoading}
      size="lg"
      className={`
        relative overflow-hidden group
        h-16 px-12 text-lg font-semibold
        bg-gradient-primary hover:shadow-glow
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        ${isLoading ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-foreground border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-6 w-6" />
              <span>{amount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 animate-bounce-gentle" />
              <span>Contribute with Base Pay</span>
            </div>
          </>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Button>
  );
}