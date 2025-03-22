import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`transform hover:scale-105 transition-transform duration-300 ${className}`}>
      <Image
        src="/images/LO.png"
        alt="Mafia Tournament Logo"
        width={200}
        height={200}
        className="mx-auto"
        priority
      />
    </div>
  );
}
