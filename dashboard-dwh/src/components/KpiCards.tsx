import { TrendingUp, TrendingDown, BookOpen, AlertTriangle, Star } from 'lucide-react';
import type { IKpis } from '../types/dashboard';

interface Props {
    kpis: IKpis;
}

interface CardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

const Card = ({ title, value, subtitle, icon, color, bg }: CardProps) => (
    <div className="bg-surface rounded-2xl p-5 border border-border flex items-start gap-4">
        <div className={`${bg} p-3 rounded-xl flex-shrink-0`}>
            <div className={color}>{icon}</div>
        </div>
        <div>
            <p className="text-text-muted text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-text-main mt-0.5">{value}</p>
            <p className="text-text-muted text-xs mt-1">{subtitle}</p>
        </div>
    </div>
);

export const KpiCards = ({ kpis }: Props) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
            title="Promedio General"
            value={kpis.promedioGeneral.toFixed(2)}
            subtitle="Sobre escala de 5.0"
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-primary"
            bg="bg-indigo-500/10"
        />
        <Card
            title="Asignaturas"
            value={kpis.totalAsignaturas}
            subtitle="En el programa"
            icon={<BookOpen className="w-5 h-5" />}
            color="text-secondary"
            bg="bg-cyan-500/10"
        />
        <Card
            title="En Riesgo"
            value={kpis.asignaturasEnRiesgo}
            subtitle="Promedio menor a 3.5"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="text-danger"
            bg="bg-red-500/10"
        />
        <Card
            title="Destacadas"
            value={kpis.asignaturasDestacadas}
            subtitle="Promedio mayor a 4.0"
            icon={<Star className="w-5 h-5" />}
            color="text-warning"
            bg="bg-yellow-500/10"
        />
    </div>
);
