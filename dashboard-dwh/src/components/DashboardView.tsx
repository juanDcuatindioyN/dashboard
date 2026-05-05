import { useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { LibraryImpactChart } from './charts/LibraryImpactChart';
import { SubjectPerformanceChart } from './charts/SubjectPerformanceChart';
import { LaboratoryUsageChart } from './charts/LaboratoryUsageChart';
import { SubjectRadarChart } from './charts/SubjectRadarChart';
import { LaboratoryAreaChart } from './charts/LaboratoryAreaChart';
import { SyncButton } from './SyncButton';
import { Database, AlertCircle } from 'lucide-react';

export const DashboardView = () => {
    const { dashboardData, isLoading, error, fetchDashboardData } = useDashboardStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (isLoading && !dashboardData) {
        return (
            <div className="w-full h-full flex flex-col gap-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-8 w-64 bg-surface animate-pulse rounded-md"></div>
                    <div className="h-10 w-48 bg-surface animate-pulse rounded-md"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="h-80 bg-surface animate-pulse rounded-xl"></div>
                    <div className="h-80 bg-surface animate-pulse rounded-xl"></div>
                    <div className="h-80 bg-surface animate-pulse rounded-xl"></div>
                    <div className="h-80 bg-surface animate-pulse rounded-xl"></div>
                    <div className="h-80 bg-surface animate-pulse rounded-xl lg:col-span-2 xl:col-span-3"></div>
                </div>
            </div>
        );
    }

    if (error && !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-text-main mb-2">Error de conexión</h2>
                <p className="text-text-muted mb-6 max-w-md">{error}</p>
                <button 
                    onClick={() => fetchDashboardData()}
                    className="bg-surface hover:bg-slate-700 text-text-main px-6 py-2 rounded-lg transition-colors border border-slate-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary" />
                        Dashboard Analítico DWH
                    </h1>
                    <p className="text-text-muted mt-1">Consolidado de datos académicos, biblioteca y laboratorios.</p>
                </div>
                <SyncButton />
            </header>

            {!dashboardData ? (
                <div className="flex items-center justify-center h-64 bg-surface rounded-xl border border-slate-800">
                    <p className="text-text-muted">No hay datos disponibles. Ejecuta una sincronización.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LibraryImpactChart data={dashboardData.libraryImpact} />
                    <SubjectPerformanceChart data={dashboardData.subjectPerformance} />
                    
                    <SubjectRadarChart data={dashboardData.subjectPerformance} />
                    <LaboratoryAreaChart data={dashboardData.laboratoryUsage} />

                    <div className="lg:col-span-2">
                        <LaboratoryUsageChart data={dashboardData.laboratoryUsage} />
                    </div>
                </div>
            )}
        </div>
    );
};
