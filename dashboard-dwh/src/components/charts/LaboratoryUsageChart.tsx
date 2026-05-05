import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ILaboratoryUsage } from '../../types/dashboard';

interface Props {
    data: ILaboratoryUsage[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const LaboratoryUsageChart = ({ data }: Props) => {
    const formattedData = data.map(item => ({
        ...item,
        horasUso: Number(item.horasUso)
    }));

    return (
        <div className="w-full h-80 bg-surface rounded-xl p-4 shadow-sm border border-slate-800">
            <h3 className="text-lg font-semibold text-text-main mb-4">Uso de Equipos de Laboratorio</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="horasUso"
                        nameKey="equipo"
                    >
                        {formattedData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        formatter={(value: any) => [`${value} horas`, 'Uso']}
                    />
                    <Legend 
                        layout="vertical"
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
