import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { ISubjectPerformance } from '../../types/dashboard';

interface Props {
    data: ISubjectPerformance[];
}

export const TopSubjectsChart = ({ data }: Props) => {
    const sorted = [...data]
        .map(d => ({ ...d, promedioNotas: Number(d.promedioNotas) }))
        .sort((a, b) => b.promedioNotas - a.promedioNotas);

    const top5 = sorted.slice(0, 5);
    const bottom5 = sorted.slice(-5).reverse();
    const combined = [
        ...top5.map(d => ({ ...d, tipo: 'top' })),
        ...bottom5.map(d => ({ ...d, tipo: 'bottom' })),
    ];

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-text-main">Mejores y Peores Asignaturas</h3>
                <div className="flex gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"/>Top 5</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger inline-block"/>Bottom 5</span>
                </div>
            </div>
            <p className="text-xs text-text-muted mb-4">Comparativa de rendimiento por asignatura</p>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={combined} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" horizontal={false} />
                    <XAxis type="number" domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey="asignatura"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={130}
                        tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 16) + '…' : v}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9' }}
                        formatter={(v: number) => [v.toFixed(2), 'Promedio']}
                    />
                    <ReferenceLine x={3.5} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Riesgo', fill: '#fbbf24', fontSize: 10 }} />
                    <Bar dataKey="promedioNotas" radius={[0, 4, 4, 0]} barSize={18}>
                        {combined.map((entry, i) => (
                            <Cell key={i} fill={entry.tipo === 'top' ? '#6366f1' : '#f87171'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
