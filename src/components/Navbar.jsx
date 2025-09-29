export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-orange h-20 flex justify-around items-center z-50">
      <button><img src="/home.svg" alt="home" className="w-6 h-6" /></button>
      <button><img src="/grid.svg" alt="grid" className="w-6 h-6" /></button>
      <button><img src="/percent.svg" alt="percent" className="w-6 h-6" /></button>
      <button><img src="/activity.svg" alt="activity" className="w-6 h-6" /></button>
      <button><img src="/settings.svg" alt="settings" className="w-6 h-6" /></button>
      <button><img src="/userMinus.svg" alt="userMinus" className="w-6 h-6" /></button>
    </nav>
  );
}