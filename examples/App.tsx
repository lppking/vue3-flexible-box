import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld'
import './index.scss'

const App = defineComponent({
  render() {
    return (
      <div>
        <h1>Vue3FlexibleBox</h1>
        <HelloWorld />
      </div>
    )
  }
})

export default App
