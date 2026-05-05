export interface Estudiante {
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo_institucional: string;
  semestre_actual: number;
}

export interface Asignatura {
  codigo_asignatura: string;
  nombre_asignatura: string;
  creditos: number;
}

export interface Curso {
  id_curso: string;
  codigo_asignatura: string;
  periodo: string;
  docente_asignado: string;
}

export interface Matricula {
  id_matricula: string;
  numero_documento: string;
  id_curso: string;
}

export interface Calificacion {
  id_matricula: number;
  seguimiento_1: number;
  seguimiento_2: number;
  seguimiento_3: number;
  nota_final: number;
}

export interface Asistencia {
  id_asistencia: number;
  id_matricula: number;
  fecha_clase: string;
  estado_asistencia: boolean;
}
