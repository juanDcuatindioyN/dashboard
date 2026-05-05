import { RefreshCw } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { toast } from 'sonner';

export const SyncButton = () => {
    const { runEtl, isSyncing, fetchDashboardData } = useDashboardStore();

    const handleSync = async () => {
        const toastId = toast.loading('Iniciando sincronización del Data Warehouse...', {
            description: 'Este proceso puede tardar unos segundos.'
        });

        try {
            await runEtl();
            toast.success('Sincronización completada con éxito', {
                id: toastId,
                description: 'Los datos han sido consolidados en el DWH.'
            });
            // Fetch updated data after successful sync
            await fetchDashboardData();
        } catch (error: any) {
            toast.error('Error en la sincronización', {
                id: toastId,
                description: error.response?.data?.message || 'Ha ocurrido un error inesperado al sincronizar.'
            });
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
        >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Data Warehouse'}
        </button>
    );
};
