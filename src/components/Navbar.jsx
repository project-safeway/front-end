import { useLocation, useNavigate } from "react-router-dom";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/menu", icon: "/home.svg", alt: "home" },
    { path: "/chamada", icon: "/grid.svg", alt: "grid" },
    { path: "/financeiro", icon: "/percent.svg", alt: "percent" },
    { path: "/rotas", icon: "/activity.svg", alt: "activity" },
    { path: "/configuracoes", icon: "/settings.svg", alt: "settings" },
    { path: "/login", icon: "/userMinus.svg", alt: "userMinus" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-orange h-15 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
        >
          <img
            src={item.icon}
            alt={item.alt}
            className={`w-6 h-6 ${location.pathname === item.path ? "filter invert" : ""}`}
          />
        </button>
      ))}
    </nav>
  );
}