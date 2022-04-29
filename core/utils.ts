import { App, Plugin } from 'vue'
import { ref, Ref, unref, UnwrapRef, watch } from 'vue'
import { ALL_HANDLES } from './constants'
import { HandleEvents, ResizingHandle, UpdateRef, UseRefReturn } from './types'

export function getElSize(el: Element) {
  const style = window.getComputedStyle(el)
  return {
    width: parseFloat(style.getPropertyValue('width')),
    height: parseFloat(style.getPropertyValue('height'))
  }
}

export function createEventListenerFunction(type: 'addEventListener' | 'removeEventListener') {
  return <K extends keyof HTMLElementEventMap>(el: HTMLElement, events: K | K[], handler: any) => {
    if (!el) return
    if (typeof events === 'string') {
      events = [events]
    }

    events.forEach((eventName) => el[type](eventName, handler))
  }
}

export const addEvents = createEventListenerFunction('addEventListener')

export const removeEvents = createEventListenerFunction('removeEventListener')

export function useState<T>(
  source: Ref<T>,
  name: string,
  emit: (event: string, params: unknown) => void
) {
  const state = ref<T>(unref(source))

  const setState = (val: T) => {
    state.value = <UnwrapRef<T>>val
  }

  watch(
    source,
    (val) => {
      if (val !== state.value) {
        setState(val)
      }
    },
    {
      immediate: true
    }
  )

  watch(
    state,
    (val) => {
      emit(`update:${name}`, val)
    },
    {
      immediate: true
    }
  )

  return [state, setState] as [Ref<T>, (val: T) => void]
}

export function useRef<T>(val: T): UseRefReturn<T> {
  const valRef = ref<T>(val)

  const updateVal: UpdateRef<T> = (nextVal: UnwrapRef<T>) => {
    valRef.value = nextVal
  }

  return [valRef, updateVal]
}

export function filterValidHandles(handles: ResizingHandle[]) {
  if (Array.isArray(handles) && handles.length > 0) {
    return handles.map((item) => {
      if (ALL_HANDLES.includes(item)) {
        return item
      }
    })
  } else {
    return []
  }
}

export function getPosition(e: HandleEvents) {
  return [e.pageX, e.pageY]
}

export function withInstall<T>(comp: T): T & Plugin {
  const c = comp as any
  c.install = function (app: App) {
    app.component(c.name, comp)
  }

  return comp as T & Plugin
}
