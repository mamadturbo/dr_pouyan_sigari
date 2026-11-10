"use client";
import {createContext} from 'react';
import type {ScrollState} from '@/lib/scroll-controller';

export const ScrollModeContext=createContext<ScrollState['mode']>('natural');
