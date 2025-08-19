import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import BuyCreditsModal from "@/components/credits/BuyCreditsModal";
import { useState } from "react";

const Header = () => {
  const { user, credits, logout } = useApp();
  const [buyOpen, setBuyOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold tracking-tight">Refi</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <NavLink to="/hub" className={({isActive})=> isActive?"text-foreground":"hover:text-foreground"}>Testing Hub</NavLink>
            <NavLink to="/post" className={({isActive})=> isActive?"text-foreground":"hover:text-foreground"}>Post a Test</NavLink>
            <NavLink to="/forms" className={({isActive})=> isActive?"text-foreground":"hover:text-foreground"}>Forms</NavLink>
            <NavLink to="/profile" className={({isActive})=> isActive?"text-foreground":"hover:text-foreground"}>Profile</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Badge variant="secondary">Credits: {credits}</Badge>
              <Button variant="secondary" onClick={() => setBuyOpen(true)}>Buy Credits</Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>Login</Button>
          )}
        </div>
      </div>
      <BuyCreditsModal open={buyOpen} onOpenChange={setBuyOpen} />
    </header>
  );
};

export default Header;
