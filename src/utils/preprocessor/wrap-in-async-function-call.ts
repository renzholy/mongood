import template from '@babel/template'
import type { File, Statement } from '@babel/types'

export default function wrapInAsyncFunctionCall(ast: File): Statement {
  const applyTemplate = template.statement('(async () => { %%body%% })()')
  return applyTemplate({ body: ast.program.body })
}
