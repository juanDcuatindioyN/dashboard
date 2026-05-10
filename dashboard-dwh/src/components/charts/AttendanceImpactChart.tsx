import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ILaboratoryUsage } from '../../types/dashboard';

interface Props {
    data: ILaboratoryUsage[];
}

export const AttendanceImpactChart = ({ data }: Props) => {
    // Top 10 asignaturas con más asistencias registradas
    const sorted = [...data]
        .map(d => ({ asignatura: d.equipo, asistencias: Number(d.horasUso) }))
        .sort((a, b) => b.asistencias - a.asistencias)
        .slice(0, 10);

    const max = sorted[0]?.asistencias ?? 1;

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <h3 className="text-base font-semibold text-text-main mb-1">Asistencia por Asignatura</h3>
            <p className="text-xs text-text-muted mb-4">Top 10 asignaturas con mayor número de asistencias registradas</p>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="asignatura"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={140}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9' }}
                        formatter={(v: number) => [v, 'Asistencias']}
                    />
                    <Bar dataKey="asistencias" radius={[0, 4, 4, 0]} barSize={18}>
                        {sorted.map((entry, i) => {
                            const intensity = 0.4 + 0.6 * (entry.asistencias / max);
                            return <Cell key={i} fill={`rgba(34, 211, 238, ${intensity})`} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
