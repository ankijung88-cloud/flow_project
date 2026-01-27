export default function VideoGrid() {
  return (
    <div className="py-20 grid grid-cols-2 gap-10 px-12">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-gray-200 h-64 rounded-xl flex items-center justify-center"
        >
          ▶
        </div>
      ))}
    </div>
  );
}
