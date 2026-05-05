import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ILaboratoryUsage } from '../../types/dashboard';

interface Props {
    data: ILaboratoryUsage[];
}

export const LaboratoryAreaChart = ({ data }: Props) => {
    const formattedData = data.map(item => ({
        ...item,
        horasUso: Number(item.horasUso)
    }));

    return (
        <div className="w-full h-80 bg-surface rounded-xl p-4 shadow-sm border border-slate-800">
            <h3 className="text-lg font-semibold text-text-main mb-4">Tendencia de Uso (Área)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                        dataKey="equipo" 
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
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="horasUso" 
                        name="Horas de Uso"
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorHoras)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
