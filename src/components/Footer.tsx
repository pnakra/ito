const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} is this ok?
        </p>
      </div>
    </footer>
  );
};

export default Footer;
