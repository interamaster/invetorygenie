
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-foreground mt-4 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span>Return to Home</span>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
