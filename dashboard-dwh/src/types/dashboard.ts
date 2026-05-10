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

export interface IDashboardData {
    libraryImpact: ILibraryImpact[];
    subjectPerformance: ISubjectPerformance[];
    laboratoryUsage: ILaboratoryUsage[];
}

export interface IDashboardResponse {
    success: boolean;
    data: IDashboardData;
}

// Derived KPIs computed on the frontend
export interface IKpis {
    promedioGeneral: number;
    totalAsignaturas: number;
    asignaturasEnRiesgo: number;   // promedio < 3.5
    asignaturasDestacadas: number; // promedio >= 4.0
}
