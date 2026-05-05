import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ISubjectPerformance } from '../../types/dashboard';

interface Props {
    data: ISubjectPerformance[];
}

export const SubjectPerformanceChart = ({ data }: Props) => {
    const formattedData = data.map(item => ({
        ...item,
        promedioNotas: Number(item.promedioNotas)
    }));

    return (
        <div className="w-full h-80 bg-surface rounded-xl p-4 shadow-sm border border-slate-800">
            <h3 className="text-lg font-semibold text-text-main mb-4">Rendimiento por Asignatura</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                        dataKey="asignatura" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: string) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                        height={30}
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
                        itemStyle={{ color: '#8b5cf6' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="promedioNotas" 
                        name="Promedio de Notas"
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
