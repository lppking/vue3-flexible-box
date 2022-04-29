import { tryOnMounted, tryOnUnmounted } from '@vueuse/core'
import { computed, ref, Ref, unref, watchEffect } from 'vue'
import { DOWN_EVENTS, MOVE_EVENTS, UP_EVENTS } from './constants'
import { HandleEvents, MaybeHTMLElement, ResizingHandle } from './types'
import { addEvents, getElSize, getPosition, removeEvents, useRef } from './utils'

/**
 * 计算纵横比
 * @param width
 * @param height
 * @returns
 */
export function useAspectRatio(width: Ref<number>, height: Ref<number>) {
  return computed(() => height.value / width.value)
}

/**
 * 初始化容器的节点引用，容器宽高
 * @returns
 */
export function useInitParent() {
  const containerRef = ref<MaybeHTMLElement>(null)

  // 每次动态获取父节点宽高，兼容父节点宽高动态变化的情况
  const getParentSize = (): [number, number] => {
    if (containerRef.value && containerRef.value.parentElement) {
      const { width, height } = getElSize(containerRef.value.parentElement)
      return [width, height]
    }
    return [-1, -1]
  }

  return {
    containerRef,
    getParentSize
  }
}
/**
 * 计算容器节点的style
 * @param width
 * @param heigh
 * @param top
 * @param left
 * @returns
 */
export function useContainerStyle(
  width: Ref<number>,
  heigh: Ref<number>,
  top: Ref<number>,
  left: Ref<number>
) {
  return computed(() => {
    return {
      width: `${width.value}px`,
      height: `${heigh.value}px`,
      top: `${top.value}px`,
      left: `${left.value}px`
    }
  })
}

/**
 * 计算容器节点的动态class
 */
export type UseContainerClassOption = {
  classNameDraggable?: Ref<string> | string
  classNameResizable?: Ref<string> | string
  classNameDragging?: Ref<string> | string
  classNameResizing?: Ref<string> | string
  classNameActive?: Ref<string> | string
}
export function useContainerClass(
  dependsList: {
    draggable: Ref<boolean>
    resizable: Ref<boolean>
    dragging: Ref<boolean>
    resizing: Ref<boolean>
    active: Ref<boolean>
  },
  classNameOption?: UseContainerClassOption
) {
  const defaultContainerClassNames: Required<UseContainerClassOption> = {
    classNameDraggable: 'draggable',
    classNameResizable: 'resizable',
    classNameDragging: 'dragging',
    classNameResizing: 'resizing',
    classNameActive: 'active'
  }

  classNameOption = classNameOption || defaultContainerClassNames

  const {
    classNameActive = defaultContainerClassNames.classNameActive,
    classNameDraggable = defaultContainerClassNames.classNameDraggable,
    classNameDragging = defaultContainerClassNames.classNameDragging,
    classNameResizable = defaultContainerClassNames.classNameResizable,
    classNameResizing = defaultContainerClassNames.classNameResizing
  } = classNameOption

  return computed(() => {
    return {
      [unref(classNameActive)]: dependsList.active.value,
      [unref(classNameDraggable)]: dependsList.draggable.value,
      [unref(classNameDragging)]: dependsList.dragging.value,
      [unref(classNameResizable)]: dependsList.resizable.value,
      [unref(classNameResizing)]: dependsList.resizing.value
    }
  })
}

export function useContainerActivable(
  containerRef: Ref<MaybeHTMLElement>,
  states: {
    setEnable: (val: boolean) => void
  }
) {
  function containerWithBlur(e: Event) {
    states.setEnable(false)
  }

  function containerWithFocus(e: Event) {
    states.setEnable(true)
  }

  tryOnMounted(() => {
    if (containerRef.value) {
      addEvents(containerRef.value, DOWN_EVENTS, containerWithFocus)
      addEvents(document.documentElement, DOWN_EVENTS, containerWithBlur)
    }
  })

  tryOnUnmounted(() => {
    if (containerRef.value) {
      removeEvents(containerRef.value, DOWN_EVENTS, containerWithFocus)
    }

    removeEvents(document.documentElement, DOWN_EVENTS, containerWithBlur)
  })
}

/**
 * 为容器添加resizable能力
 * @param containerRef
 * @param states
 * @returns
 */
export function useContainerResizable(
  containerRef: Ref<MaybeHTMLElement>,
  states: {
    top: Ref<number>
    left: Ref<number>
    width: Ref<number>
    height: Ref<number>
    minW: Ref<number>
    minH: Ref<number>
    maxH: Ref<number>
    maxW: Ref<number>
    enable: Ref<boolean>
    resizing: Ref<boolean>
    resizable: Ref<boolean>
    setResizing: (val: boolean) => void
    setWidth: (val: number) => void
    setHeight: (val: number) => void
    setTop: (val: number) => void
    setLeft: (val: number) => void
  }
) {
  // 记录上一次移动的累积距离
  let prevX = 0
  let prevY = 0

  // 记录移动的相对上一次的距离
  const [resizeDistance, setResizeDistance] = useRef<{
    x?: number
    y?: number
    top?: number
    left?: number
  }>({
    x: 0,
    y: 0,
    top: 0,
    left: 0
  })

  // 记录handleName
  let currHandleName: ResizingHandle = ''

  const {
    width,
    height,
    setHeight,
    setWidth,
    enable,
    resizing,
    setResizing,
    top,
    left,
    setLeft,
    setTop,
    resizable
  } = states

  const ResizeManager = {
    resizeml(e: HandleEvents) {
      // left + width
      const [endX] = getPosition(e)
      setResizeDistance({
        x: prevX - endX,
        left: endX - prevX
      })
    },
    resizebm(e: HandleEvents) {
      // height
      const [, endY] = getPosition(e)
      setResizeDistance({
        y: endY - prevY
      })
    },
    resizemr(e: HandleEvents) {
      // width
      const [endX] = getPosition(e)
      setResizeDistance({
        x: endX - prevX
      })
    },
    resizetm(e: HandleEvents) {
      // top + height
      const [, endY] = getPosition(e)
      setResizeDistance({
        y: prevY - endY,
        top: endY - prevY
      })
    },
    resizetl(e: HandleEvents) {
      const [endX, endY] = getPosition(e)
      setResizeDistance({
        left: endX - prevX,
        top: endY - prevY,
        x: prevX - endX,
        y: prevY - endY
      })
    },
    resizetr(e: HandleEvents) {
      const [endX, endY] = getPosition(e)
      setResizeDistance({
        x: endX - prevX,
        y: prevY - endY,
        top: endY - prevY
      })
    },
    resizebl(e: HandleEvents) {
      const [endX, endY] = getPosition(e)
      setResizeDistance({
        x: prevX - endX,
        y: endY - prevY,
        left: endX - prevX
      })
    },
    resizebr(e: HandleEvents) {
      const [endX, endY] = getPosition(e)
      setResizeDistance({
        x: endX - prevX,
        y: endY - prevY
      })
    }
  }

  const resizeHandleDown = (e: HandleEvents, handleName: ResizingHandle) => {
    e.preventDefault()
    // 单点拖拽
    if (!enable.value || resizing.value || !resizable.value) return
    e.stopPropagation()

    const [_startX, _startY] = getPosition(e)
    prevX = _startX
    prevY = _startY

    currHandleName = handleName

    // resize-start
    setResizing(true)
  }

  const resizeHandleMove = (e: HandleEvents) => {
    e.preventDefault()
    if (!enable.value || !resizing.value || !currHandleName || !resizable.value) return

    setResizing(true)

    const [endX, endY] = getPosition(e)

    ResizeManager[`resize${currHandleName}`](e)

    prevX = endX
    prevY = endY
  }

  const resizeHandleUp = (e: HandleEvents) => {
    e.preventDefault()
    if (!enable.value || !resizing.value || !resizable.value) return
    setResizing(false)
    prevX = 0
    prevY = 0
  }

  // 利用watch天然的节流效果

  watchEffect(() => {
    if (!enable.value || !resizable.value || !resizing.value) return
    if (resizeDistance.value.x !== undefined) {
      setWidth(width.value + resizeDistance.value.x)
    }
    if (resizeDistance.value.y !== undefined) {
      setHeight(height.value + resizeDistance.value.y)
    }
    if (resizeDistance.value.top !== undefined) {
      setTop(top.value + resizeDistance.value.top)
    }
    if (resizeDistance.value.left !== undefined) {
      setLeft(left.value + resizeDistance.value.left)
    }
  })

  tryOnMounted(() => {
    addEvents(document.documentElement, MOVE_EVENTS, resizeHandleMove)
    addEvents(document.documentElement, UP_EVENTS, resizeHandleUp)
  })

  tryOnUnmounted(() => {
    removeEvents(document.documentElement, MOVE_EVENTS, resizeHandleMove)
    removeEvents(document.documentElement, UP_EVENTS, resizeHandleUp)
  })

  return {
    resizeHandleDown
  }
}

/**
 * 为容器添加draggable能力
 * @param containerRef
 * @param states
 */
export function useContainerDraggable(
  containerRef: Ref<MaybeHTMLElement>,
  states: {
    top: Ref<number>
    left: Ref<number>
    draggable: Ref<boolean>
    dragging: Ref<boolean>
    enable: Ref<boolean>
    minTop: Ref<number>
    minLeft: Ref<number>
    minRight: Ref<number>
    minBottom: Ref<number>
    getParentSize: () => [number, number]
    height: Ref<number>
    width: Ref<number>
    setLeft: (val: number) => void
    setTop: (val: number) => void
    setDragging: (val: boolean) => void
  }
) {
  const {
    top,
    left,
    setTop,
    setLeft,
    draggable,
    dragging,
    setDragging,
    enable,
    minBottom,
    minLeft,
    minRight,
    minTop,
    getParentSize,
    width,
    height
  } = states

  let prevY = 0
  let prevX = 0

  const [dragDistance, setDragDistance] = useRef({
    x: 0,
    y: 0
  })

  const safeSetTop = (top: number, dragDistanceY: number) => {
    const nextTop = top + dragDistanceY
    const [, parentHeight] = getParentSize()
    if (nextTop >= minTop.value && minBottom.value <= parentHeight - nextTop - height.value) {
      setTop(nextTop)
    }
  }

  const safeSetLeft = (left: number, dragDistanceX: number) => {
    const nextLeft = left + dragDistanceX
    const [parentWidth] = getParentSize()
    if (nextLeft >= minLeft.value && minRight.value <= parentWidth - nextLeft - width.value) {
      setLeft(nextLeft)
    }
  }

  watchEffect(() => {
    if (!enable.value || !draggable.value || !dragging.value) return
    safeSetTop(top.value, dragDistance.value.y)
    safeSetLeft(left.value, dragDistance.value.x)
  })

  const draggableHandleDown = (e: HandleEvents) => {
    e.preventDefault()
    if (!enable.value || !draggable.value || dragging.value) return
    e.stopPropagation()
    const [startX, startY] = getPosition(e)

    setDragging(true)

    prevY = startY
    prevX = startX
  }

  const draggableHandleMove = (e: HandleEvents) => {
    e.preventDefault()
    if (!enable.value || !draggable.value || !dragging.value) return

    const [endX, endY] = getPosition(e)

    setDragDistance({
      x: endX - prevX,
      y: endY - prevY
    })

    prevX = endX
    prevY = endY
  }

  const draggableHandleUp = (e: HandleEvents) => {
    e.preventDefault()
    if (!enable.value || !draggable.value || !dragging.value) return

    setDragging(false)

    prevX = 0
    prevY = 0
  }

  tryOnMounted(() => {
    if (!containerRef.value) {
      return
    }
    addEvents(containerRef.value, DOWN_EVENTS, draggableHandleDown)
    addEvents(document.documentElement, MOVE_EVENTS, draggableHandleMove)
    addEvents(document.documentElement, UP_EVENTS, draggableHandleUp)
  })

  tryOnUnmounted(() => {
    if (!containerRef.value) return
    removeEvents(containerRef.value, DOWN_EVENTS, draggableHandleDown)
    removeEvents(document.documentElement, MOVE_EVENTS, draggableHandleMove)
    removeEvents(document.documentElement, UP_EVENTS, draggableHandleUp)
  })
}
