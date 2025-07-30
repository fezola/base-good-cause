// Professional Header - GoFundMe-inspired Design
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernHeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function ModernHeader({ onSearch, showSearch = true }: ModernHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="font-bold text-xl sm:text-2xl text-foreground">
              FundMe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-gray-600 font-medium transition-colors duration-200"
            >
              Discover
            </Link>
            <Link
              to="/my-campaigns"
              className="text-foreground hover:text-gray-600 font-medium transition-colors duration-200"
            >
              My Campaigns
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:border-input-focus focus:ring-2 focus:ring-ring/20 transition-colors duration-200 bg-background text-sm"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Create Campaign Button */}
                <Link to="/create">
                  <Button
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">Start Campaign</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/my-campaigns">My Campaigns</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" style={{ backgroundColor: '#0000FF', color: 'white' }} className="text-xs sm:text-sm px-2 sm:px-4">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" className="hidden sm:block">
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm px-2 sm:px-4">
                    Start Campaign
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-foreground hover:text-gray-600 hover:bg-secondary rounded-md font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link
                to="/my-campaigns"
                className="block px-3 py-2 text-foreground hover:text-gray-600 hover:bg-secondary rounded-md font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Campaigns
              </Link>
              <Link
                to="/create"
                className="block px-3 py-2 text-foreground hover:text-gray-600 hover:bg-secondary rounded-md font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start a Campaign
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="lg:hidden py-3 border-t border-border">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:border-input-focus focus:ring-2 focus:ring-ring/20 transition-colors duration-200 bg-background text-sm"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
