import type { ReactNode } from 'react';
import { Activity, Menu } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar / Navigation (Simple for now) */}
            <aside className="w-full md:w-64 bg-surface border-r border-slate-800 p-6 flex flex-col hidden md:flex">
                <div className="flex items-center gap-3 mb-10 text-text-main">
                    <Activity className="w-8 h-8 text-secondary" />
                    <span className="text-xl font-bold tracking-tight">DWH System</span>
                </div>
                
                <nav className="flex-1">
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-primary rounded-lg font-medium border border-blue-500/20">
                                <span>Dashboard</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <div className="mt-auto pt-6 border-t border-slate-800">
                    <p className="text-xs text-text-muted text-center">© 2026 Universidad Mariana</p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-surface border-b border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-main">
                    <Activity className="w-6 h-6 text-secondary" />
                    <span className="font-bold">DWH System</span>
                </div>
                <button className="text-text-muted hover:text-text-main">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
