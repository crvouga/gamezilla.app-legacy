import { createElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return createElement(
    View,
    { style: styles.container },
    createElement(Text, null, 'Open up App.tsx to start working on your app!'),
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
