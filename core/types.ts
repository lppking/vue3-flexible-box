import type { UnwrapRef, Ref } from 'vue'

export type ResizingHandle = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br' | ''

export type VFBHTMLElementEventNames = keyof HTMLElementEventMap

export type HandleEvents = MouseEvent

export type UpdateRef<T> = (nextVal: UnwrapRef<T>) => void

export type UseRefReturn<T> = [ReadOnlyRef<T>, UpdateRef<T>]

export type ReadOnlyRef<T> = Readonly<Ref<UnwrapRef<T>>>

export type MaybeHTMLElement = HTMLElement | null
