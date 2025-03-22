'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-4">حدث خطأ ما</h2>
        <p className="text-gray-300 mb-6">نأسف لهذا الخطأ، يرجى المحاولة مرة أخرى</p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
