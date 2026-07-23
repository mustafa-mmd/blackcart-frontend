import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SearchDropdown from '../search/SearchDropdown';
import MiniCart from '../cart/MiniCart';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  const { settings, loading } = useSettings();

  const logoUrl = settings?.logo?.url
    ? settings.logo.url.startsWith('http')
      ? settings.logo.url
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo.url}`
    : '';
  const showLogo = !loading && logoUrl && failedLogoUrl !== logoUrl;
  const storeName = settings?.general?.storeName || 'BlackCart.store';

  const closeMenu = () => setIsMenuOpen(false);
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/categories', label: 'Categories' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container-lg section-padding">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex shrink-0 items-center">
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt={settings?.logo?.alt || storeName}
                  className="max-h-16 w-auto object-contain"
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-xl font-bold text-white">B</div>
                  <span className="text-2xl font-bold text-gray-900">{storeName}</span>
                </div>
              )}
            </Link>

            <nav className="hidden shrink-0 items-center gap-6 md:ml-6 md:flex xl:ml-10 xl:gap-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `border-b-2 px-0.5 py-2 font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-700 hover:border-primary-200 hover:text-primary-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <SearchDropdown />

            <div className="flex shrink-0 items-center gap-2 xl:gap-4">
              <button onClick={() => setIsMobileSearchOpen(true)} className="p-2 text-gray-600 hover:text-primary-600 lg:hidden" aria-label="Open search">
                <Search className="h-6 w-6" />
              </button>
              <MiniCart />
              <button onClick={() => setIsMenuOpen(open => !open)} className="p-2 text-gray-600 hover:text-primary-600 md:hidden" aria-label="Toggle menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <nav className="space-y-2 border-t border-gray-200 py-4 md:hidden" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-lg border-l-4 px-3 py-2.5 font-medium transition-colors ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/40 lg:hidden" onClick={() => setIsMobileSearchOpen(false)}>
          <div className="absolute inset-x-0 top-0 bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Search</span>
              <button onClick={() => setIsMobileSearchOpen(false)} className="ml-auto rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close search"><X className="h-5 w-5" /></button>
            </div>
            <SearchDropdown isMobilePage onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

