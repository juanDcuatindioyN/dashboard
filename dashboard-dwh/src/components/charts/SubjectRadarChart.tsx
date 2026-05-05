import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { ISubjectPerformance } from '../../types/dashboard';

interface Props {
    data: ISubjectPerformance[];
}

export const SubjectRadarChart = ({ data }: Props) => {
    const formattedData = data.map(item => ({
        ...item,
        promedioNotas: Number(item.promedioNotas)
    }));

    return (
        <div className="w-full h-80 bg-surface rounded-xl p-4 shadow-sm border border-slate-800">
            <h3 className="text-lg font-semibold text-text-main mb-4">Balance de Rendimiento (Radar)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formattedData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                        dataKey="asignatura" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        stroke="#334155"
                    />
                    <Radar 
                        name="Promedio de Notas" 
                        dataKey="promedioNotas" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.6} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f59e0b' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
