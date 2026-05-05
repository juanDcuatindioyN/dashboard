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
