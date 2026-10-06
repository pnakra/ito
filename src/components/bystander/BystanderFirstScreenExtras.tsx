import { Link } from "react-router-dom";

/** Links only: feedback and funding live on their own screen. */
const BystanderFirstScreenExtras = () => {
  return (
    <div className="space-y-12">
      <div className="mt-5 space-y-6 text-center">
        <Link to="/witness/tip" className="text-[13px] text-muted-foreground underline hover:text-foreground">
          Already know what happened? Write an anonymous tip
        </Link>
        <div className="border-t border-border pt-4 space-y-2 text-[12px] text-muted-foreground">
          <p>Beta. ito is an AI and can't call anyone. In an emergency, call <a className="underline" href="tel:911">911</a>.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/bystanderbeta/feedback" className="underline hover:text-foreground">Tell us what to fix</Link>
            <Link to="/witness/report" className="underline hover:text-foreground">See what a report looks like</Link>
            <Link to="/bystanderbeta/feedback#fund" className="underline hover:text-foreground">Fund or pilot this</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BystanderFirstScreenExtras;
