const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} is this ok?
        </p>
      </div>
    </footer>
  );
};

export default Footer;
