import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface SlideLayoutProps {
  children: ReactNode;
  page: number;
  section?: string;
  className?: string;
}

/** Fixed 1920×1080 canvas shared by the editor, thumbnails, presenter, and print. */
const SlideLayout = ({ children, page, section = "Online bystander intervention", className = "" }: SlideLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const { width, height } = container.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <div
        className="slide-wrapper slide-content"
        data-slide-content
        style={{ "--scale": scale } as CSSProperties}
      >
        <div className="flex h-full flex-col px-[120px] pb-[92px] pt-[92px]">
          {children}
        </div>
        <footer className="slide-footer absolute bottom-[38px] left-[120px] right-[120px] flex items-center justify-between text-muted-foreground">
          <span>ito / Override Labs · {section}</span>
          <span className="slide-page">{String(page).padStart(2, "0")} / 07</span>
        </footer>
      </div>
    </div>
  );
};

export default SlideLayout;
