'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = session?.user?.role;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-[#111] rounded-full px-6 py-3 flex items-center justify-between">

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-yellow-400">Home</Link>
            {status === 'authenticated' && role !== 'creator' && (
              <Link href="/dashboard" className="text-white hover:text-yellow-400">Dashboard</Link>
            )}
            {status === 'authenticated' && role !== 'brand' && (
              <Link href="/store" className="text-white hover:text-yellow-400">Store</Link>
            )}
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-300">
            <span className="text-white font-extrabold text-2xl">COLLAB</span>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22L3.5 14L7 10.5L12 15.5L17 10.5L20.5 14L12 22Z" />
              <path d="M12 13L3.5 5L7 1.5L12 6.5L17 1.5L20.5 5L12 13Z" />
            </svg>
            <span className="text-white font-extrabold text-2xl">JUNCTION</span>
          </Link>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {role !== 'brand' && <Link href="/about" className="text-white hover:text-yellow-400">About</Link>}

            {status === 'authenticated' ? (
              <div className="flex items-center space-x-4 relative">
                {role !== 'brand' && (
                  <>
                    <Link href="/store" className="text-white hover:text-yellow-400">
                      <ShoppingBag className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/profile/${encodeURIComponent(session.user?.email)}`}
                      className="text-white hover:text-yellow-400"
                    >
                      <User className="h-5 w-5" />
                    </Link>
                  </>
                )}
                <div onClick={toggleDropdown} className="cursor-pointer relative">
                  <div className="rounded-full w-8 h-8 overflow-hidden border-2 border-white">
                    <img
                      src={session.user?.image || '/default-avatar.png'}
                      alt="User Avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-10 bg-[#111] p-2 rounded-lg shadow-md mt-2 w-40 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-white hover:text-yellow-400 py-2 px-4 rounded-md transition duration-300 hover:scale-105"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button asChild variant="ghost" className="text-white hover:text-yellow-400">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#111] mt-2 rounded-xl p-4 space-y-3">
            <Link href="/" className="block text-white hover:text-yellow-400">Home</Link>
            {status === 'authenticated' && role !== 'creator' && (
              <Link href="/dashboard" className="block text-white hover:text-yellow-400">Dashboard</Link>
            )}
            {status === 'authenticated' && role !== 'brand' && (
              <Link href="/store" className="block text-white hover:text-yellow-400">Store</Link>
            )}
            {role !== 'brand' && (
              <Link href="/about" className="block text-white hover:text-yellow-400">About</Link>
            )}
            {status === 'authenticated' ? (
              <>
                {role !== 'brand' && (
                  <Link
                    href={`/profile/${encodeURIComponent(session.user?.email)}`}
                    className="block text-white hover:text-yellow-400"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white hover:text-yellow-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/sign-in" className="block text-white hover:text-yellow-400">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
