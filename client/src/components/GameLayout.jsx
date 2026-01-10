export default function GameLayout({ children }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden">
      {children}
    </div>
  );
}