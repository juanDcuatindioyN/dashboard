import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ILibraryImpact } from '../../types/dashboard';

interface Props {
    data: ILibraryImpact[];
}

const COLOR_MAP: Record<string, string> = {
    'Alta':          '#34d399',
    'Media':         '#6366f1',
    'Baja':          '#fbbf24',
    'Sin actividad': '#f87171',
};

export const AttendanceImpactChart = ({ data }: Props) => {
    const formatted = data.map(d => ({
        nivel: d.nivelActividad,
        promedio: Number(d.promedioNotas),
        color: COLOR_MAP[d.nivelActividad] ?? '#94a3b8',
    }));

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <h3 className="text-base font-semibold text-text-main mb-1">Asistencia vs Rendimiento</h3>
            <p className="text-xs text-text-muted mb-4">Promedio de notas según nivel de asistencia del estudiante</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={formatted} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
                    <XAxis dataKey="nivel" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9' }}
                        formatter={(v: number) => [v.toFixed(2), 'Promedio']}
                    />
                    <Bar dataKey="promedio" radius={[4, 4, 0, 0]} barSize={48}
                        fill="#6366f1"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
