const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} IdeaSoop Beta Hub</p>
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
