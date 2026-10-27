export type TitleLines = readonly [string, string];
export interface SectionIntro {
  label: string;
  titleLines: TitleLines;
  intro?: string;
}
export interface CtaLink {
  label: string;
  href: string;
  cta: string; // cta → atributo data-cta (analytics futuro)
}
export interface HighlightText {
  text: string;
  highlight: string; // highlight se pinta en celeste
}
export interface Metric {
  value: string;
  text: string;
}
export interface Leak {
  title: string;
  text: string;
}
export interface Service {
  code: string;
  title: string;
  description: string;
  includes: readonly string[];
  cta: CtaLink;
}
export interface Rubro {
  title: string;
  text: string;
}
export interface Step {
  number: string;
  title: string;
  text: string;
}
export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  text: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}
export interface CalculatorTask {
  id: string;
  label: string;
  unit: string;
  minutes: number;
  defaultChecked: boolean;
  defaultTimesPerWeek: number;
}
