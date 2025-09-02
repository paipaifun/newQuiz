interface CommonParam {
  app_id: string
  country?: string
  userIDGetter: () => Promise<string>
  request_id: string
}

export interface Config extends Omit<CommonParam, 'request_id'> {
  signatureGetter?: () => Promise<string>
  host: string
}
