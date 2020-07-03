import saferEval from 'safer-eval'

export function toCommand(str: string): object {
  return saferEval(str, {})
}
