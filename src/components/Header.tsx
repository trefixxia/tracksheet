import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="flex flex-col items-center py-5 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer mb-4" onClick={() => router.push("/")}>
          <Logo height={50} />
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant={router.pathname === '/' ? 'default' : 'ghost'}>
              Search
            </Button>
          </Link>
          <Link href="/rated-albums">
            <Button variant={router.pathname === '/rated-albums' ? 'default' : 'ghost'}>
              Rated Albums
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Header;