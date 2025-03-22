import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl max-w-md mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">404</h2>
        <p className="text-gray-300 mb-6">عذراً، الصفحة غير موجودة</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-6 rounded-lg inline-block transition-all duration-300 transform hover:scale-105"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
