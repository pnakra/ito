import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ShredButtonProps {
  onShred: () => void;
  className?: string;
}

const ShredButton = ({ onShred, className = "" }: ShredButtonProps) => {
  const [isShredding, setIsShredding] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; rotate: number }>>([]);

  const handleShred = () => {
    setIsShredding(true);
    
    // Create particles for the shred effect
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 100,
      rotate: (Math.random() - 0.5) * 30,
    }));
    setParticles(newParticles);
    
    // Wait for animation then call onShred
    setTimeout(() => {
      onShred();
    }, 800);
  };

  if (isShredding) {
    return (
      <div className={`relative h-16 flex items-center justify-center ${className}`}>
        {/* Shredding particles */}
        {particles.map((particle, index) => (
          <div
            key={particle.id}
            className="absolute w-6 h-8 bg-gradient-to-b from-card to-muted rounded-sm animate-shred-particle"
            style={{
              left: `calc(50% + ${particle.x}px)`,
              animationDelay: `${index * 0.05}s`,
              ['--rotate' as string]: `${particle.rotate}deg`,
            }}
          />
        ))}
        
        {/* Confirmation text */}
        <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Chat cleared ✓
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleShred}
      className={`text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group ${className}`}
    >
      <Trash2 className="w-4 h-4 mr-2 group-hover:animate-pulse-soft" />
      Clear this session
    </Button>
  );
};

export default ShredButton;
