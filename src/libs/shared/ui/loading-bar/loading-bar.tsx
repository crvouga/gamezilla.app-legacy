import { useRef, useEffect } from "react";

interface LoadingBarProps {
  disabled?: boolean;
  className?: string;
  color?: string;
  backgroundColor?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  disabled = false,
  className = "",
  color = "#3B82F6",
  backgroundColor = "transparent",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let containerWidth = 0;
    if (containerRef.current && animationRef.current) {
      containerWidth = containerRef.current.getBoundingClientRect().width;
      animationRef.current.style.left = `${-0.5 * containerWidth}px`;
      animationRef.current.style.width = `${0.5 * containerWidth}px`;
    }
    if (disabled) {
      animationRef.current?.getAnimations().forEach((animation) => {
        animation.pause();
      });
    } else {
      animationRef.current?.animate(
        [
          // keyframes
          { transform: `translateX(${containerWidth * -0.5}px)` },
          { transform: `translateX(${containerWidth * 1.5}px)` },
        ],
        {
          // timing options
          duration: 800,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    }

    return () => {
      animationRef.current?.getAnimations().forEach((animation) => {
        animation.cancel();
      });
    };
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`relative h-2 overflow-hidden ${className}`}
      style={{
        backgroundColor: backgroundColor,
      }}>
      <div
        ref={animationRef}
        className="absolute left-0 top-0 h-full w-2/3 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};
