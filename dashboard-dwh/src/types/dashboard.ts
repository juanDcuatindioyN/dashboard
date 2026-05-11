export interface ILibraryImpact {
    nivelActividad: string;
    promedioNotas: string | number;
}

export interface ISubjectPerformance {
    asignatura: string;
    promedioNotas: string | number;
}

export interface ILaboratoryUsage {
    equipo: string;
    horasUso: string | number;
}

// KPIs from the DWH (returned by core-dwh)
export interface IKpiData {
    promedioGeneral: number;
    totalEstudiantes: number;
    estudiantesEnRiesgo: number;
    tasaUtilizacionRecursos: number;
}

export interface IDashboardData {
    libraryImpact: ILibraryImpact[];
    subjectPerformance: ISubjectPerformance[];
    laboratoryUsage: ILaboratoryUsage[];
    kpis?: IKpiData;
}

export interface IDashboardResponse {
    success: boolean;
    data: IDashboardData;
}
