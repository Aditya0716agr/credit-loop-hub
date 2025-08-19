const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p>© {new Date().getFullYear()} Refi</p>
          <p className="text-xs mt-1">
            by{" "}
            <a 
              href="https://www.ideasoop.online/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-foreground underline underline-offset-2"
            >
              ideasoop labs
            </a>
          </p>
        </div>
        <nav className="flex items-center gap-6">
          <a href="https://ideasoop.com" target="_blank" rel="noreferrer" className="hover:text-foreground">Back to IdeaSoop</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
