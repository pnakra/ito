import { Link } from "react-router-dom";

/** Student-facing links on the bystander beta first screen. */
const BystanderFirstScreenExtras = () => {
  return (
    <div className="space-y-12">
      <div className="mt-5 space-y-6 text-center">
        <div className="space-y-2">
          <Link to="/witness/tip" className="block text-[13px] text-muted-foreground underline hover:text-foreground">
            Already know what happened? Write an anonymous tip
          </Link>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <Link to="/witness/practice" className="underline hover:text-foreground">Practice what to do</Link>
            <Link to="/witness/guide/anonymous-posts" className="underline hover:text-foreground">Stop an online pile-on</Link>
          </div>
        </div>
        <div className="border-t border-border pt-4 space-y-2 text-[12px] text-muted-foreground">
          <p>Beta. ito is an AI and can't call anyone. In an emergency, call <a className="underline" href="tel:911">911</a>.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/bystanderbeta/feedback" className="underline hover:text-foreground">Give feedback</Link>
            <Link to="/partner-kit" className="underline hover:text-foreground">For schools, chapters and partners</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BystanderFirstScreenExtras;
