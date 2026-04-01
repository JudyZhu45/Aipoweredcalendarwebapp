import { Iteration01 } from './Iteration01';
import { Iteration02 } from './Iteration02';
import { Iteration03 } from './Iteration03';
import { Iteration04 } from './Iteration04';
import { Iteration05 } from './Iteration05';
import { Iteration06 } from './Iteration06';
import { Iteration07 } from './Iteration07';
import { Iteration08 } from './Iteration08';
import { Iteration09 } from './Iteration09';
import { Iteration10 } from './Iteration10';
import { Iteration11 } from './Iteration11';
import { Iteration12 } from './Iteration12';
import { Iteration13 } from './Iteration13';
import { Iteration14 } from './Iteration14';
import { Iteration15 } from './Iteration15';
import { Iteration16 } from './Iteration16';
import { Iteration17 } from './Iteration17';
import { Iteration18 } from './Iteration18';
import { Iteration19 } from './Iteration19';
import { Iteration20 } from './Iteration20';
import { Iteration21 } from './Iteration21';
import { Iteration22 } from './Iteration22';
import { Iteration23 } from './Iteration23';
import { Iteration24 } from './Iteration24';
import { Iteration25 } from './Iteration25';
import type { ComponentType } from 'react';

export interface IterationMeta {
  number: string;
  name: string;
  category: string;
  component: ComponentType;
}

export const ITERATIONS: IterationMeta[] = [
  { number: '01', name: 'Centered Hero',     category: 'Layout & Composition', component: Iteration01 },
  { number: '02', name: 'Split Hero',         category: 'Layout & Composition', component: Iteration02 },
  { number: '03', name: 'Full-Bleed Hero',    category: 'Layout & Composition', component: Iteration03 },
  { number: '04', name: 'Bento Grid',         category: 'Layout & Composition', component: Iteration04 },
  { number: '05', name: 'Stepped Workflow',   category: 'Layout & Composition', component: Iteration05 },
  { number: '06', name: 'Brand Default',      category: 'Visual Style',         component: Iteration06 },
  { number: '07', name: 'Dark Mode',          category: 'Visual Style',         component: Iteration07 },
  { number: '08', name: 'Gradient Pop',       category: 'Visual Style',         component: Iteration08 },
  { number: '09', name: 'Glassmorphism',      category: 'Visual Style',         component: Iteration09 },
  { number: '10', name: 'Minimal Ink',        category: 'Visual Style',         component: Iteration10 },
  { number: '11', name: 'Feature Showcase',   category: 'Content Strategy',     component: Iteration11 },
  { number: '12', name: 'Social Proof First', category: 'Content Strategy',     component: Iteration12 },
  { number: '13', name: 'Demo First',         category: 'Content Strategy',     component: Iteration13 },
  { number: '14', name: 'Problem-Solution',   category: 'Content Strategy',     component: Iteration14 },
  { number: '15', name: 'How It Works',       category: 'Content Strategy',     component: Iteration15 },
  { number: '16', name: 'Typewriter',         category: 'Motion & Interaction', component: Iteration16 },
  { number: '17', name: 'Scroll Reveal',      category: 'Motion & Interaction', component: Iteration17 },
  { number: '18', name: 'Floating Particles', category: 'Motion & Interaction', component: Iteration18 },
  { number: '19', name: 'Hover Cards',        category: 'Motion & Interaction', component: Iteration19 },
  { number: '20', name: 'Counting Stats',     category: 'Motion & Interaction', component: Iteration20 },
  { number: '21', name: 'FAQ Accordion',      category: 'Section Experiments',  component: Iteration21 },
  { number: '22', name: 'Pricing Table',      category: 'Section Experiments',  component: Iteration22 },
  { number: '23', name: 'Comparison Table',   category: 'Section Experiments',  component: Iteration23 },
  { number: '24', name: 'Timeline',           category: 'Section Experiments',  component: Iteration24 },
  { number: '25', name: 'App Store CTA',      category: 'Section Experiments',  component: Iteration25 },
];
