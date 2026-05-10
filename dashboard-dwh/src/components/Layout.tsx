import type { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background">
            {/* Top navbar */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-text-main">Universidad Mariana</span>
                        <p className="text-xs text-text-muted leading-none">Data Warehouse Académico</p>
                    </div>
                </div>
                <span className="text-xs text-text-muted hidden sm:block">Ingeniería de Sistemas · 2026</span>
            </header>

            {/* Page content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {children}
            </main>
        </div>
    );
};
