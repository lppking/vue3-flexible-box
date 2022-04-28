import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld'
import './index.scss'

const App = defineComponent({
  render() {
    return (
      <div>
        <img alt="Vue logo" src="./assets/logo.png" />
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
      </div>
    )
  }
})

export default App
