import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface CrucePoint {
  id_estudiante: string;
  total_minutos_lab: number;
  promedio_notas: number;
}

const API_URL = 'http://localhost:3003/api/etl';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-surface border border-border rounded-xl p-3 text-xs">
        <p className="text-text-muted">Estudiante: <span className="text-text-main">{d.id_estudiante}</span></p>
        <p className="text-text-muted">Horas lab: <span className="text-secondary font-semibold">{(d.total_minutos_lab / 60).toFixed(1)}h</span></p>
        <p className="text-text-muted">Promedio: <span className="text-primary font-semibold">{Number(d.promedio_notas).toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

export const ScatterLabNotasChart = () => {
  const [data, setData] = useState<CrucePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/cruce`)
      .then(r => { setData(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatted = data.map(d => ({
    ...d,
    horas: Math.round(Number(d.total_minutos_lab) / 60),
    promedio: Number(d.promedio_notas),
  }));

  return (
    <div className="bg-surface rounded-2xl p-5 border border-border lg:col-span-2">
      <h3 className="text-base font-semibold text-text-main mb-1">Esfuerzo en Laboratorio vs Rendimiento Academico</h3>
      <p className="text-xs text-text-muted mb-4">
        Cada punto representa un estudiante. Eje X: horas totales en laboratorio. Eje Y: promedio de notas.
      </p>
      {loading ? (
        <div className="h-64 animate-pulse bg-surface-2 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" />
            <XAxis
              type="number"
              dataKey="horas"
              name="Horas Lab"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            >
              <Label value="Horas en Laboratorio" offset={-10} position="insideBottom" fill="#64748b" fontSize={11} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="promedio"
              name="Promedio"
              domain={[2.5, 5]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine
              y={3.5}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              label={{ value: 'Riesgo 3.5', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={formatted}
              fill="#6366f1"
              fillOpacity={0.7}
              r={4}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
