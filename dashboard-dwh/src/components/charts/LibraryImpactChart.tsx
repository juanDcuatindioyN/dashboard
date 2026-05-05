import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ILibraryImpact } from '../../types/dashboard';

interface Props {
    data: ILibraryImpact[];
}

export const LibraryImpactChart = ({ data }: Props) => {
    // Convert promedioNotas to number for Recharts
    const formattedData = data.map(item => ({
        ...item,
        promedioNotas: Number(item.promedioNotas)
    }));

    return (
        <div className="w-full h-80 bg-surface rounded-xl p-4 shadow-sm border border-slate-800">
            <h3 className="text-lg font-semibold text-text-main mb-4">Impacto de Biblioteca en Notas</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                        dataKey="nivelActividad" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 5]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#3b82f6' }}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Bar 
                        dataKey="promedioNotas" 
                        name="Promedio de Notas"
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
