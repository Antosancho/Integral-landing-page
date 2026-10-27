import type { SectionIntro, TeamMember } from './types';

export const equipoIntro: SectionIntro = {
  label: 'Quiénes somos',
  titleLines: ['Dos hermanos,', 'una misma idea.'],
  intro: 'Uno entiende el negocio y el otro lo convierte en sistemas. Siempre hablás con las mismas dos personas.',
};

export const team: readonly TeamMember[] = [
  { name: 'Felipe Sancho', initials: 'FS', role: 'Dirección y clientes', text: 'Va a cada negocio, escucha cómo trabajan y define qué conviene resolver primero.' },
  { name: 'Antonio Sancho', initials: 'AS', role: 'Desarrollo', text: 'Diseña y programa los sistemas y las automatizaciones con IA.' },
];
