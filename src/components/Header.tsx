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
          <Logo width={200} />
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button 
              variant={router.pathname === '/' ? 'default' : 'ghost'}
              className={router.pathname === '/' ? 'bg-purple-700 hover:bg-purple-800' : 'text-gray-300 hover:text-white hover:bg-gray-900'}
            >
              Search
            </Button>
          </Link>
          <Link href="/rated-albums">
            <Button 
              variant={router.pathname === '/rated-albums' ? 'default' : 'ghost'}
              className={router.pathname === '/rated-albums' ? 'bg-purple-700 hover:bg-purple-800' : 'text-gray-300 hover:text-white hover:bg-gray-900'}
            >
              Rated Albums
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Header;