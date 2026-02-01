import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // This forces the window to the top every time the path changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}