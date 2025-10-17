export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  external?: boolean;
}

export interface CodeExample {
  language: 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'bash';
  code: string;
  fileName?: string;
  description?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[][];
}

export interface ApiMethod {
  name: string;
  signature: string;
  description: string;
  parameters: ApiParameter[];
  returnType: {
    type: string;
    description: string;
  };
  example?: CodeExample;
  notes?: string[];
}

export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface ApiInterface {
  name: string;
  definition: string;
  description: string;
  properties: ApiProperty[];
}

export interface ApiProperty {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

export interface ToolDocumentation {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  useCases: UseCase[];
  api: {
    serviceName: string;
    methods: ApiMethod[];
    interfaces: ApiInterface[];
  };
  examples: {
    basic: CodeExample[];
    advanced: CodeExample[];
  };
  relatedTools?: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface UseCase {
  title: string;
  description: string;
  example?: string;
}

export interface DocPageState {
  copiedExampleId: string | null;
  activeTab: string | null;
  expandedSections: Set<string>;
  tableOfContents: TocItem[];
}

export interface TocItem {
  title: string;
  level: number;
  id: string;
  children?: TocItem[];
}
