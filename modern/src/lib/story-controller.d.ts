import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
export type StoryController = {readonly locked: boolean; step(direction:number):boolean;cancel():void;refresh():void;destroy():void};
export function mountStory(root: HTMLElement, animation: typeof gsap, triggers: typeof ScrollTrigger, options?:{managed?:boolean}): StoryController;
