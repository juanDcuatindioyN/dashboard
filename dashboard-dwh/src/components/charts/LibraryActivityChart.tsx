import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ILibraryImpact } from '../../types/dashboard';

interface Props {
    data: ILibraryImpact[];
}

const COLOR_MAP: Record<string, string> = {
    'Alta':          '#34d399',
    'Media':         '#6366f1',
    'Baja':          '#fbbf24',
    'Sin actividad': '#475569',
};

export const LibraryActivityChart = ({ data }: Props) => {
    // Filter out "Sin actividad" to focus on active students, or show all
    const formatted = data.map(d => ({
        nivel: d.nivelActividad,
        estudiantes: Number(d.promedioNotas), // repurposed field = total students
        color: COLOR_MAP[d.nivelActividad] ?? '#94a3b8',
    }));

    return (
        <div className="bg-surface rounded-2xl p-5 border border-border">
            <h3 className="text-base font-semibold text-text-main mb-1">Actividad en Biblioteca</h3>
            <p className="text-xs text-text-muted mb-4">Distribucion de estudiantes por nivel de actividad en recursos de biblioteca (fuente: MongoDB)</p>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={formatted} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
                    <XAxis dataKey="nivel" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d45', borderRadius: '10px', color: '#f1f5f9' }}
                        formatter={(v: number) => [v, 'Estudiantes']}
                    />
                    <Bar dataKey="estudiantes" radius={[4, 4, 0, 0]} barSize={48}>
                        {formatted.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
