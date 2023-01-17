import { Browser, Debug, Program } from '@gamezilla/core';
import * as ReactDOM from 'react-dom/client';
import { init, subscriptions, update, View } from './app';


//
//
//
// Main
//
//
//

const { program } =
  Debug.ReduxDevTools.withDebugger(
    Program.create({
      init: init(Browser.getLocation()),
      subscriptions,
      update,
    })
  )


Program.run(program)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

Program.subscribe(program, state => {
  root.render(<View model={state.model} $send={program.$send} />)
})

