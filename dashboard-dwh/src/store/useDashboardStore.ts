import { create } from 'zustand';
import axios from 'axios';
import type { IDashboardData, IDashboardResponse } from '../types/dashboard';

interface DashboardState {
    dashboardData: IDashboardData | null;
    isLoading: boolean;
    error: string | null;
    isSyncing: boolean;
    fetchDashboardData: () => Promise<void>;
    runEtl: () => Promise<void>;
}

const API_URL = 'http://localhost:3000/api/etl';

export const useDashboardStore = create<DashboardState>((set) => ({
    dashboardData: null,
    isLoading: false,
    error: null,
    isSyncing: false,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get<IDashboardResponse>(`${API_URL}/dashboard`);
            if (response.data.success) {
                set({ dashboardData: response.data.data, isLoading: false });
            } else {
                set({ error: 'Failed to fetch dashboard data', isLoading: false });
            }
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            set({ 
                error: error.response?.data?.message || 'Error connecting to the DWH API', 
                isLoading: false 
            });
        }
    },

    runEtl: async () => {
        set({ isSyncing: true, error: null });
        try {
            await axios.post(`${API_URL}/run`);
            set({ isSyncing: false });
        } catch (error: any) {
            console.error('Error running ETL:', error);
            set({ 
                error: error.response?.data?.message || 'Error executing ETL process', 
                isSyncing: false 
            });
            throw error; // Rethrow to let the UI handle the toast error
        }
    }
}));
