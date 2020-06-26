import { monaco, ControlledEditor, Monaco } from '@monaco-editor/react'

let _monaco: Monaco

monaco.init().then((_m) => {
  _monaco = _m
  _monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1108],
  })
  _monaco.languages.typescript.typescriptDefaults.addExtraLib(`
  /**
    * @param {string} id Must be a 24 byte hex string.
    */
  function ObjectId(id: string): { $oid: string }

  /**
    * @param {string} date An ISO-8601 date string
    */
  function ISODate(date: string): { $date: { $numberLong: string } }

  /**
    * @param {string} A high-precision decimal as string.
    */
  function NumberDecimal(num: string | number): { $numberDecimal: string }

  /**
    * @param {string} num A long number string
    */
  function NumberLong(num: string): { $numberLong: string }

  /**
    * @param {string} num A int number string
    */
  function NumberInt(num: string): { $numberInt: string }

  /**
   * @param {number} t A positive integer for the seconds since epoch.
   * @param {number} i A positive integer for the increment.
   */
  function Timestamp(t: number, i: number): { $timestamp: { t: number, i: number } }

  /**
   * @param {number} subType BSON binary subtype. See the extended bson documentation http://bsonspec.org/spec.html for subtypes available.
   * @param {string} base64 Base64 encoded (with padding as “=”) payload string.
   */
  function BinData(subType: number, base64: string): { $binary: { base64: string, subType: string } }
  `)
  _monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems(model, position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })
      const match = textUntilPosition.match(
        /"dependencies"\s*:\s*\{\s*("[^"]*"\s*:\s*"[^"]*"\s*,\s*)*([^"]*)?$/,
      )
      if (!match) {
        return { suggestions: [] }
      }
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      return {
        suggestions: [
          {
            label: '"lodash"',
            kind: _monaco.languages.CompletionItemKind.Function,
            documentation: 'The Lodash library exported as Node.js modules.',
            insertText: '"lodash": "*"',
            range,
          },
          {
            label: '"express"',
            kind: _monaco.languages.CompletionItemKind.Function,
            documentation: 'Fast, unopinionated, minimalist web framework',
            insertText: '"express": "*"',
            range,
          },
          {
            label: '"mkdirp"',
            kind: _monaco.languages.CompletionItemKind.Function,
            documentation: 'Recursively mkdir, like <code>mkdir -p</code>',
            insertText: '"mkdirp": "*"',
            range,
          },
          {
            label: '"my-third-party-library"',
            kind: _monaco.languages.CompletionItemKind.Function,
            documentation: 'Describe your library here',
            // eslint-disable-next-line no-template-curly-in-string
            insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
            insertTextRules:
              _monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
        ],
      }
    },
  })
})

export async function colorize(
  text: string,
  isDarkMode: boolean,
): Promise<string> {
  _monaco?.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs')
  return _monaco?.editor.colorize(text, 'javascript', { tabSize: 2 }) || ''
}

export { ControlledEditor }
