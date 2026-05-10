import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ISubjectPerformance } from '../../types/dashboard';

interface Props {
    data: ISubjectPerformance[];
}

export const SubjectPerformanceChart = ({ data }: Props) => {
    const formatted = [...data]
        .map(d => ({ ...d, promedioNotas: Number(d.promedioNotas) }))
        .sort((a, b) => b.promedioNotas - a.promedioNotas);

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <h3 className="text-base font-semibold text-text-main mb-1">Rendimiento por Asignatura</h3>
            <p className="text-xs text-text-muted mb-4">Promedio de notas de todas las asignaturas del programa</p>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={formatted} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
                    <XAxis
                        dataKey="asignatura"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + '…' : v}
                        interval={2}
                    />
                    <YAxis
                        domain={[2.5, 5]}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <ReferenceLine y={3.5} stroke="#fbbf24" strokeDasharray="4 4"
                        label={{ value: 'Riesgo 3.5', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9', fontSize: 12 }}
                        formatter={(v: number) => [v.toFixed(2), 'Promedio']}
                    />
                    <Line
                        type="monotone"
                        dataKey="promedioNotas"
                        stroke="url(#lineGrad)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
