import { useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { KpiCards } from './KpiCards';
import { TopSubjectsChart } from './charts/TopSubjectsChart';
import { GradeDistributionChart } from './charts/GradeDistributionChart';
import { AttendanceImpactChart } from './charts/AttendanceImpactChart';
import { SubjectPerformanceChart } from './charts/SubjectPerformanceChart';
import { SyncButton } from './SyncButton';
import { AlertCircle, BarChart2 } from 'lucide-react';
import type { IKpis } from '../types/dashboard';

const computeKpis = (data: ReturnType<typeof useDashboardStore.getState>['dashboardData']): IKpis => {
    if (!data) return { promedioGeneral: 0, totalAsignaturas: 0, asignaturasEnRiesgo: 0, asignaturasDestacadas: 0 };
    const notas = data.subjectPerformance.map(d => Number(d.promedioNotas));
    return {
        promedioGeneral:      notas.reduce((a, b) => a + b, 0) / (notas.length || 1),
        totalAsignaturas:     notas.length,
        asignaturasEnRiesgo:  notas.filter(n => n < 3.5).length,
        asignaturasDestacadas: notas.filter(n => n >= 4.0).length,
    };
};

export const DashboardView = () => {
    const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardStore();

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading && !dashboardData) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-surface animate-pulse rounded-2xl border border-border" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-72 bg-surface animate-pulse rounded-2xl border border-border" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error && !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="bg-red-500/10 p-4 rounded-full">
                    <AlertCircle className="w-10 h-10 text-danger" />
                </div>
                <h2 className="text-xl font-bold text-text-main">Error de conexión</h2>
                <p className="text-text-muted max-w-sm text-sm">{error}</p>
                <button
                    onClick={() => fetchDashboardData()}
                    className="mt-2 px-5 py-2 rounded-lg bg-surface border border-border text-text-main text-sm hover:border-primary transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const kpis = computeKpis(dashboardData);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <BarChart2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-main">Dashboard Analítico</h1>
                        <p className="text-xs text-text-muted">Rendimiento académico · Programa de Ingeniería de Sistemas</p>
                    </div>
                </div>
                <SyncButton />
            </div>

            {!dashboardData ? (
                <div className="flex items-center justify-center h-64 bg-surface rounded-2xl border border-border">
                    <p className="text-text-muted text-sm">Sin datos. Ejecuta una sincronización.</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <KpiCards kpis={kpis} />

                    {/* Charts grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Full-width: rendimiento por asignatura */}
                        <div className="lg:col-span-2">
                            <SubjectPerformanceChart data={dashboardData.subjectPerformance} />
                        </div>

                        {/* Top/Bottom asignaturas */}
                        <TopSubjectsChart data={dashboardData.subjectPerformance} />

                        {/* Distribución de notas */}
                        <GradeDistributionChart data={dashboardData.subjectPerformance} />

                        {/* Asistencia vs rendimiento */}
                        <div className="lg:col-span-2">
                            <AttendanceImpactChart data={dashboardData.libraryImpact} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
