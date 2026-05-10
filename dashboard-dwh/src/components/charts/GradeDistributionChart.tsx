import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ISubjectPerformance } from '../../types/dashboard';

interface Props {
    data: ISubjectPerformance[];
}

const RANGES = [
    { label: '< 3.0',   min: 0,   max: 3.0,  color: '#f87171' },
    { label: '3.0–3.5', min: 3.0, max: 3.5,  color: '#fbbf24' },
    { label: '3.5–4.0', min: 3.5, max: 4.0,  color: '#34d399' },
    { label: '4.0–4.5', min: 4.0, max: 4.5,  color: '#6366f1' },
    { label: '> 4.5',   min: 4.5, max: 5.01, color: '#22d3ee' },
];

export const GradeDistributionChart = ({ data }: Props) => {
    const distribution = RANGES.map(r => ({
        rango: r.label,
        cantidad: data.filter(d => {
            const n = Number(d.promedioNotas);
            return n >= r.min && n < r.max;
        }).length,
        color: r.color,
    }));

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <h3 className="text-base font-semibold text-text-main mb-1">Distribución de Notas</h3>
            <p className="text-xs text-text-muted mb-4">Cantidad de asignaturas por rango de promedio</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distribution} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
                    <XAxis dataKey="rango" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9' }}
                        formatter={(v: number) => [v, 'Asignaturas']}
                    />
                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={36}>
                        {distribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
