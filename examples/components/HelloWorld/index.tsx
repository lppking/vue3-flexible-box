import { defineComponent, ref } from 'vue'
import Vue3FlexibleBox from '../../../core'
import './index.scss'

const HelloWorld = defineComponent({
  components: {
    Vue3FlexibleBox
  },
  setup() {
    const boxInfo = ref({
      width: 200,
      height: 200,
      x: 0,
      y: 0
    })

    const boxInfo1 = ref({
      width: 200,
      height: 200,
      x: 0,
      y: 0
    })

    const onBoxDragEnd = () => {
      console.log('===>>', boxInfo.value)
    }

    return {
      boxInfo,
      boxInfo1,
      onBoxDragEnd
    }
  },
  render() {
    return (
      <div>
        <div class="container">
          <Vue3FlexibleBox
            class="default"
            v-model:h={this.boxInfo.height}
            v-model:w={this.boxInfo.width}
            v-model:x={this.boxInfo.x}
            v-model:y={this.boxInfo.y}
            resizable={true}
            minTop={0}
            minLeft={0}
            minRight={0}
            minBottom={0}
            onDragEnd={this.onBoxDragEnd}
          >
            <div class="center">This is a flexible box11!</div>
          </Vue3FlexibleBox>
          <Vue3FlexibleBox
            class="default"
            v-model:h={this.boxInfo1.height}
            v-model:w={this.boxInfo1.width}
            v-model:x={this.boxInfo1.x}
            v-model:y={this.boxInfo1.y}
            resizable={true}
            minTop={0}
            minLeft={0}
            minRight={0}
            minBottom={0}
            onDragEnd={this.onBoxDragEnd}
          >
            <div class="center">This is a flexible box22!</div>
          </Vue3FlexibleBox>
        </div>
      </div>
    )
  }
})

export default HelloWorld
