import { ResizingHandle, VFBHTMLElementEventNames } from './types'

export const ALL_HANDLES: ResizingHandle[] = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br']

export const DOWN_EVENTS: VFBHTMLElementEventNames[] = ['mousedown', 'touchstart']

export const UP_EVENTS: VFBHTMLElementEventNames[] = ['mouseup', 'touchend']

export const MOVE_EVENTS: VFBHTMLElementEventNames[] = ['mousemove', 'touchmove']
