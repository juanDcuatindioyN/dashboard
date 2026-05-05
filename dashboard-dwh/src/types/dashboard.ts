export interface ILibraryImpact {
    nivelActividad: string;
    promedioNotas: string | number; // Los datos numéricos procesados desde la DB pueden llegar como string
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
