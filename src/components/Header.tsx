import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Logo />
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