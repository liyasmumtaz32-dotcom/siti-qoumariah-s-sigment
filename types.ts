export interface Reference {
  type: string; // 'JOUR', 'BOOK', 'WEB'
  author: string;
  year: string;
  title: string;
  publication: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
}

export interface GeneratedContent {
  topic: string;
  essayTitle: string;
  introduction: string;
  bodyParagraphs: Array<{
    heading: string;
    content: string;
  }>;
  conclusion: string;
  references: Reference[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AssignmentCategory = 'ESSAY' | 'CASE_STUDY' | 'DISCUSSION';

export type WritingStyle = 'FORMAL' | 'CRITICAL' | 'PRACTICAL';

export type OutputFormat = 'PARAGRAPH' | 'BULLET_POINTS';

export interface AssignmentConfig {
  internationalRefs: number;
  nationalRefs: number;
  pageCount: number;
}