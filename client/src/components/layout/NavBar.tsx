import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Brain, 
  Home, 
  Mic, 
  MessageCircle, 
  BarChart, 
  Menu,
  FileText, 
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar() {
  const [location, setLocation] = useLocation();
  const [activePath, setActivePath] = useState('/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Update active path when location changes
  useEffect(() => {
    if (location === '/text') {
      setActivePath('/text');
    } else if (location === '/voice') {
      setActivePath('/voice');
    } else if (location === '/stats') {
      setActivePath('/stats');
    } else if (location === '/about') {
      setActivePath('/about');
    } else if (location === '/modules') {
      setActivePath('/modules');
    } else {
      setActivePath('/');
    }
  }, [location]);
  
  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-beige-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Brain className="text-beige-600 h-6 w-6" />
              <h1 className="text-xl font-semibold text-beige-700">Therapeutic AI</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex gap-1 sm:gap-2">
              <li>
                <Button 
                  variant={activePath === '/' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/')}
                  className="px-3 py-2 text-sm"
                >
                  <Home className="h-4 w-4 inline mr-1" />
                  Home
                </Button>
              </li>
              <li>
                <Button 
                  variant={activePath === '/voice' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/voice')}
                  className="px-3 py-2 text-sm"
                >
                  <Mic className="h-4 w-4 inline mr-1" />
                  Voice Therapy
                </Button>
              </li>
              <li>
                <Button 
                  variant={activePath === '/text' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/text')}
                  className="px-3 py-2 text-sm"
                >
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  Text Therapy
                </Button>
              </li>
              <li>
                <Button 
                  variant={activePath === '/modules' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/modules')}
                  className="px-3 py-2 text-sm"
                >
                  <Layers className="h-4 w-4 inline mr-1" />
                  Modules
                </Button>
              </li>
              <li>
                <Button 
                  variant={activePath === '/stats' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/stats')}
                  className="px-3 py-2 text-sm"
                >
                  <BarChart className="h-4 w-4 inline mr-1" />
                  Stats
                </Button>
              </li>
              <li>
                <Button 
                  variant={activePath === '/about' ? 'secondary' : 'ghost'}
                  onClick={() => setLocation('/about')}
                  className="px-3 py-2 text-sm"
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  About
                </Button>
              </li>
            </ul>
          </nav>
          
          {/* Mobile Navigation - Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] bg-beige-100 p-0">
                <SheetHeader className="p-4 border-b border-beige-200">
                  <SheetTitle className="flex items-center gap-2 text-beige-700">
                    <Brain className="text-beige-600 h-5 w-5" />
                    Therapeutic AI
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ staggerChildren: 0.05 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/')}
                          >
                            <Home className="h-5 w-5 mr-3" />
                            Home
                          </Button>
                        </SheetClose>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/voice' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/voice' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/voice')}
                          >
                            <Mic className="h-5 w-5 mr-3" />
                            Voice Therapy
                          </Button>
                        </SheetClose>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/text' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/text' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/text')}
                          >
                            <MessageCircle className="h-5 w-5 mr-3" />
                            Text Therapy
                          </Button>
                        </SheetClose>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/modules' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/modules' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/modules')}
                          >
                            <Layers className="h-5 w-5 mr-3" />
                            Modules
                          </Button>
                        </SheetClose>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/stats' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/stats' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/stats')}
                          >
                            <BarChart className="h-5 w-5 mr-3" />
                            Stats
                          </Button>
                        </SheetClose>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={activePath === '/about' ? 'secondary' : 'ghost'}
                            className={`w-full justify-start rounded-none px-6 py-6 text-left ${
                              activePath === '/about' ? 'bg-beige-200/50' : ''
                            }`}
                            onClick={() => handleNavigation('/about')}
                          >
                            <FileText className="h-5 w-5 mr-3" />
                            About
                          </Button>
                        </SheetClose>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
