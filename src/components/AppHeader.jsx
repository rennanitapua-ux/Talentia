import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Award, UserRound, LogOut, Building2, Brain, ClipboardList, FileBarChart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { userName } from '@/lib/accounts';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = {
  company: [
    { to: '/company', label: 'Painel', icon: LayoutDashboard },
    { to: '/company/jobs/new', label: 'Nova vaga', icon: Plus },
    { to: '/company/intelligence', label: 'Inteligência', icon: Brain },
    { to: '/company/processes', label: 'Processos', icon: ClipboardList },
    { to: '/company/profile', label: 'Perfil', icon: Building2 },
  ],
  candidate: [
    { to: '/candidate', label: 'Skill Passport', icon: Award },
    { to: '/candidate/profile', label: 'Meu perfil', icon: UserRound },
  ],
};

export default function AppHeader({ area }) {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center gap-4 sm:gap-8">
        <Link to={area === 'company' ? '/company' : '/candidate'} className="flex-shrink-0"><Logo size="sm" withText /></Link>
        <nav className="flex items-center gap-1">
          {NAV[area].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
                pathname === to ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block text-right leading-tight">
            <div className="text-sm text-foreground truncate max-w-[200px]">{userName(user)}</div>
            {area === 'company' && user?.company_name && <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{user.company_name}</div>}
          </div>
          <ThemeToggle />
          <button onClick={() => base44.auth.logout('/')} title="Sair" className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}