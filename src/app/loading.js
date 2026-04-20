export default function Loading() {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-[300]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" />
        <p className="text-dark-400 text-sm mt-4">Loading...</p>
      </div>
    </div>
  );
}