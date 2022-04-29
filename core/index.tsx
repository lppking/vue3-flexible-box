import { defineComponent, PropType, toRef, watch } from 'vue'
import { ALL_HANDLES } from './constants'
import {
  useAspectRatio,
  useContainerActivable,
  useContainerClass,
  useContainerDraggable,
  useContainerResizable,
  useContainerStyle,
  useInitParent
} from './hooks'
import { ResizingHandle } from './types'
import './index.scss'
import { filterValidHandles, useRef, useState, withInstall } from './utils'

const VfbProps = {
  class: {
    type: String,
    default: ''
  },
  w: {
    type: Number,
    default: 0
  },
  h: {
    type: Number,
    default: 0
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  draggable: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  minW: {
    type: Number,
    default: 10
  },
  minH: {
    type: Number,
    default: 10
  },
  maxW: {
    type: Number,
    default: Infinity
  },
  maxH: {
    type: Number,
    default: Infinity
  },
  minLeft: {
    type: Number,
    default: -Infinity
  },
  minTop: {
    type: Number,
    default: -Infinity
  },
  minRight: {
    type: Number,
    default: -Infinity
  },
  minBottom: {
    type: Number,
    default: -Infinity
  },
  active: {
    type: Boolean,
    default: false
  },
  // parent: {
  //   type: Boolean,
  //   default: false,
  // },
  handles: {
    type: Array as PropType<ResizingHandle[]>,
    default: ALL_HANDLES
  },
  classNameDraggable: {
    type: String,
    default: 'draggable'
  },
  classNameResizable: {
    type: String,
    default: 'resizable'
  },
  classNameDragging: {
    type: String,
    default: 'dragging'
  },
  classNameResizing: {
    type: String,
    default: 'resizing'
  },
  classNameActive: {
    type: String,
    default: 'active'
  },
  classNameHandle: {
    type: String,
    default: 'handle'
  }
  // lockAspectRatio: {
  //   type: Boolean,
  //   default: false,
  // },
}

const VfbEmits = [
  'activated',
  'deactivated',
  'drag-start',
  'resize-start',
  'dragging',
  'resizing',
  'drag-end',
  'resize-end'
]

const Vue3FlexibleBox = withInstall(
  defineComponent({
    name: 'Vue3FlexibleBox',
    props: VfbProps,
    emits: VfbEmits,
    setup(props, { emit }) {
      // initState
      const [height, setHeight] = useState(toRef(props, 'h'), 'h', emit)
      const [width, setWidth] = useState(toRef(props, 'w'), 'w', emit)
      const [left, setLeft] = useState(toRef(props, 'x'), 'x', emit)
      const [top, setTop] = useState(toRef(props, 'y'), 'y', emit)

      // resize limit
      const [minW] = useState(toRef(props, 'minW'), 'minW', emit)
      const [minH] = useState(toRef(props, 'minH'), 'minH', emit)
      const [maxW] = useState(toRef(props, 'maxW'), 'maxW', emit)
      const [maxH] = useState(toRef(props, 'maxH'), 'maxH', emit)

      // drag limit
      const [minTop] = useState(toRef(props, 'minTop'), 'minTop', emit)
      const [minLeft] = useState(toRef(props, 'minLeft'), 'minLeft', emit)
      const [minRight] = useState(toRef(props, 'minRight'), 'minRight', emit)
      const [minBottom] = useState(toRef(props, 'minBottom'), 'minBottom', emit)

      // 功能开关
      const [draggable] = useState(toRef(props, 'draggable'), 'draggable', emit)
      const [resizable] = useState(toRef(props, 'resizable'), 'resizable', emit)

      // 功能状态
      const [dragging, setDragging] = useRef(false)
      const [resizing, setResizing] = useRef(false)

      // const resizingHandle = ref<ResizingHandle>('')
      // const aspectRatio = useAspectRatio(width, height)

      const [enable, setEnable] = useState(toRef(props, 'active'), 'active', emit)
      watch(enable, (newVal, oldVal) => {
        if (!oldVal && newVal) {
          emit('activated')
        } else if (oldVal && !newVal) {
          emit('deactivated')
        }
      })

      // initParent
      const { containerRef, getParentSize } = useInitParent()

      const styles = useContainerStyle(width, height, top, left)

      const containerClasses = useContainerClass(
        {
          active: enable,
          draggable,
          dragging,
          resizable,
          resizing
        },
        {
          classNameActive: toRef(props, 'classNameActive'),
          classNameDraggable: toRef(props, 'classNameDraggable'),
          classNameDragging: toRef(props, 'classNameDragging'),
          classNameResizable: toRef(props, 'classNameResizable'),
          classNameResizing: toRef(props, 'classNameResizing')
        }
      )

      // 容器添加活跃态和非活跃态的切换
      useContainerActivable(containerRef, {
        setEnable
      })

      // 容器添加resize
      const { resizeHandleDown } = useContainerResizable(containerRef, {
        top,
        left,
        enable,
        resizing,
        width,
        height,
        minH,
        minW,
        maxH,
        maxW,
        resizable,
        setHeight,
        setWidth,
        setResizing,
        setTop,
        setLeft
      })

      // 容器添加draggable
      useContainerDraggable(containerRef, {
        top,
        left,
        draggable,
        dragging,
        enable,
        minBottom,
        minLeft,
        minRight,
        minTop,
        width,
        height,
        getParentSize,
        setDragging,
        setLeft,
        setTop
      })

      watch(resizing, (newVal, prevVal) => {
        if (newVal && !prevVal) {
          emit('resize-start')
        } else if (!newVal && prevVal) {
          emit('resize-end')
        }
      })

      watch(dragging, (newVal, prevVal) => {
        if (newVal && !prevVal) {
          emit('drag-start')
        } else if (!newVal && prevVal) {
          emit('drag-end')
        }
      })

      return {
        width,
        height,
        left,
        top,
        enable,
        minW,
        minH,
        dragging,
        resizing,
        // resizingHandle,
        maxW,
        maxH,
        // aspectRatio,
        containerRef,
        styles,
        containerClasses,
        resizeHandleDown,
        minTop,
        minLeft,
        minRight,
        minBottom
      }
    },

    render() {
      const { containerClasses } = this
      return (
        <div
          ref="containerRef"
          style={this.styles}
          class={{
            'vfb-container': true,
            [this.class]: true,
            ...this.containerClasses
          }}
        >
          {this.$slots.default ? this.$slots.default() : null}
          {...filterValidHandles(this.handles).map((item) => {
            return item ? (
              <div
                class={`vfb-handle vfb-handle-${item}`}
                style={`display: ${this.enable ? 'block' : 'none'}`}
                onMousedown={(e: MouseEvent) => this.resizeHandleDown(e, item)}
              ></div>
            ) : null
          })}
        </div>
      )
    }
  })
)

export default Vue3FlexibleBox
