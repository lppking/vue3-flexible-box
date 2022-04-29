import { defineComponent } from 'vue'
import ComponentUtil from './utils/ComponentUtil'
const Button = ComponentUtil.withInstall(
  defineComponent({
    name: 'Button',
    render() {
      return <button>this is a button</button>
    }
  })
)

export default Button
