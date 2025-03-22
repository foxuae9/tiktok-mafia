export default function Loading() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="text-white mt-4 text-xl">جاري التحميل...</p>
      </div>
    </div>
  );
}
