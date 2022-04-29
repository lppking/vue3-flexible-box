import { defineComponent, ref } from 'vue'
import './index.scss'

const HelloWorld = defineComponent({
  props: {
    msg: String
  },
  setup() {
    const count = ref(0)
    return {
      count
    }
  },
  render() {
    return (
      <div>
        <h1>{this.msg}</h1>
      </div>
    )
  }
})

export default HelloWorld
