interface Window {
  FBInstant: any
  onFBGameStarted: () => Promise<void>
  onFBInstantInited: () => Promise<void>
}

declare module '*.svg?react' {
  import * as React from 'react'

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}
