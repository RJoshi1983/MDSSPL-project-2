// Shared types used by the front end, the back end and every service module.

export type Role = 'client' | 'staff' | 'verifier' | 'admin';

export const ROLES: { id: Role; label: string; description: string }[] = [
  { id: 'client', label: 'Client', description: 'Organisations entering their own data' },
  { id: 'staff', label: 'Staff / Consultant', description: 'MDSSPL consultants who prepare and review projects' },
  { id: 'verifier', label: 'Third-party verifier', description: 'Independent reviewers who verify submitted projects' },
  { id: 'admin', label: 'Admin', description: 'Manages users, roles and all projects' },
];

export type ColumnType = 'text' | 'number' | 'select';
export interface Column {
  key: string;
  label: string;
  type: ColumnType;
  unit?: string;
  options?: string[];
}

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'table';
export interface Field {
  key: string;
  label: string;
  type: FieldType;
  unit?: string;
  hint?: string;
  options?: string[];
  columns?: Column[]; // for type "table"
  required?: boolean;
}

export interface Step {
  id: string;
  title: string;
  intro?: string;
  fields: Field[];
}

export interface ResultRow {
  label: string;
  value: number | string;
  unit?: string;
  note?: string;
  strong?: boolean;
}
export interface ResultSection {
  title: string;
  rows: ResultRow[];
}

export type StepData = Record<string, any>;
export type ProjectData = Record<string, StepData>; // stepId -> values

export interface ServiceModule {
  id: string; // url-safe id, e.g. "ghg"
  name: string; // full name
  short: string; // short name
  colorToken: string; // design-system colour token, e.g. "svc-ghg"
  summary: string;
  standards: string[];
  steps: Step[];
  calculate: (data: ProjectData) => ResultSection[];
}

export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'verified';
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  verified: 'Verified',
};

export interface Project {
  id: string;
  owner_id: string;
  owner_name?: string;
  service: string;
  title: string;
  financial_year: string;
  status: ProjectStatus;
  data: ProjectData;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  organisation: string;
  role: Role;
}
