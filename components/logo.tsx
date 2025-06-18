import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/su4j8oqw.png"
        alt="WebPhim Logo"
        width={40}
        height={40}
        className="rounded-lg"
      />
      <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Sơn PTIT
      </span>
    </Link>
  );
} 