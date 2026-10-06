import type { ReactNode } from "react";

const BystanderSectionHeading = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-center mb-6">
    <h2
      className="text-foreground text-center text-[32px] font-normal italic leading-[1.2] tracking-normal"
      style={{ fontFamily: '"Newsreader", "Georgia", serif' }}
    >
      {children}
    </h2>
    <svg className="mt-1 text-primary/30" width="120" height="8" viewBox="0 0 120 8" fill="none" aria-hidden="true">
      <path d="M2 5.5C20 2.5 40 6 60 3.5C80 1 100 5.5 118 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default BystanderSectionHeading;