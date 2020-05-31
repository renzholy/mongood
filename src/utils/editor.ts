import { monaco, ControlledEditor, Monaco } from '@monaco-editor/react'

let _monaco: Monaco | undefined

monaco.init().then((_m) => {
  _monaco = _m
})

export async function colorize(
  text: string,
  isDarkMode: boolean,
): Promise<string> {
  _monaco?.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  return _monaco?.editor.colorize(text, 'javascript', { tabSize: 2 }) || ''
}

export { ControlledEditor }
