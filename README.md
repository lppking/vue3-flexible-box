<h1 align="center">vue3-flexible-box</h1>

> 支持相对于容器的拖拽和修改大小的方框 Vue3 组件

## 目录

- [特性](#特性)
- [Props](#props)
- [Events](#events)

### 功能

- 支持拖拽，可自定义功能开启还是关闭
- 支持修改大小，可自定义功能开启还是关闭
- 支持把拖拽和修改大小限制在指定范围
- 支持自定义类名
- 基于 Vue3 + TS

### Props

#### class

type: `String`
default: `''`

设置容器自定义 class 样式类名

#### w

type: `Number`
default: `0`

设置宽度，可使用`v-model`双向绑定

```html
<!--JSX-->
<Vue3FlexibleBox v-model:w="{boxInfo.width}" />

<!--template-->
<Vue3FlexibleBox v-model:w="boxInfo.width" />
```
