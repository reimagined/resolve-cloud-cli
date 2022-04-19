import fetch, { RequestInfo, RequestInit } from 'node-fetch'

import { isRetryable } from 'resolve-cloud-sdk'

export default async (
  url: RequestInfo,
  init: RequestInit,
  expectedStatuses: Array<number> = []
) => {
  for (;;) {
    try {
      const res = await fetch(url, init)

      if (!res.ok && !expectedStatuses.includes(res.status)) {
        throw new Error(await res.text())
      }

      return res
    } catch (error) {
      if (
        isRetryable({
          errorText: `${error}`,
          baseUrl: url as string,
          method: init.method ?? 'GET',
        })
      ) {
        continue
      }
      throw error
    }
  }
}
