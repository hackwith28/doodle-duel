export default function WordHint({ word, fullWord, isDrawer }) {
  return (
    <div className="text-white font-black tracking-widest">
      {isDrawer ? fullWord : word}
    </div>
  );
}
