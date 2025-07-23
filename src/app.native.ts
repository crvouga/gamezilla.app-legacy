import { createElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export function App() {
  return createElement(
    View,
    { style: styles.container },
    createElement(Text, { style: styles.text }, 'Open up App.ts to start working on your app!___'),
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
})
