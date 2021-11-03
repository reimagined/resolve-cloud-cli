import * as configHelpers from '../../utils/config-helpers'

test('configHelpers.get should work correctly', async () => {
  const config = {
    a: {
      b: {
        c: true,
      },
      d: false,
    },
    e: true,
  }

  expect(configHelpers.get(config, '')).toEqual(config)
  expect(configHelpers.get(config, 'a')).toEqual(config.a)
  expect(configHelpers.get(config, 'a.b')).toEqual(config.a.b)
  expect(configHelpers.get(config, 'a.b.c')).toEqual(config.a.b.c)
  expect(configHelpers.get(config, 'a.b.c.d')).toEqual(null)
  expect(configHelpers.get(config, 'a.d')).toEqual(config.a.d)
  expect(configHelpers.get(config, 'e')).toEqual(config.e)
})

test('configHelpers.set should work correctly', async () => {
  const config: any = {
    e: true,
  }

  configHelpers.set(config, 'a', {
    b: {
      c: true,
    },
    d: false,
  })
  expect(config.a).toEqual({
    b: {
      c: true,
    },
    d: false,
  })
  configHelpers.set(config, 'e', false)
  expect(config.e).toEqual(false)
  expect(config).toEqual({
    a: {
      b: {
        c: true,
      },
      d: false,
    },
    e: false,
  })
})

test('configHelpers.unset should work correctly', async () => {
  const config = {
    a: {
      b: {
        c: true,
      },
      d: false,
    },
    e: true,
  }

  configHelpers.unset(config, 'a.b.c.d')
  expect(config).toEqual({
    a: {
      b: {
        c: true,
      },
      d: false,
    },
    e: true,
  })
  configHelpers.unset(config, 'a.b.c')
  expect(config).toEqual({
    a: {
      b: {},
      d: false,
    },
    e: true,
  })
  configHelpers.unset(config, 'a')
  expect(config).toEqual({
    e: true,
  })
  configHelpers.unset(config, 'e')
  expect(config).toEqual({})
})

test('use-case "real world" should work correctly', () => {
  const config = {}

  configHelpers.set(config, 'api_url', 'https://api.unit-test.resolve.fit')
  configHelpers.set(config, 'client_id', '1322m4g5f6rr7r38k9kk094m2')
  configHelpers.set(config, 'credentials.user', 'test@example.com')
  configHelpers.set(config, 'credentials.refresh_token', '12345')

  expect(config).toEqual({
    api_url: 'https://api.unit-test.resolve.fit',
    client_id: '1322m4g5f6rr7r38k9kk094m2',
    credentials: {
      user: 'test@example.com',
      refresh_token: '12345',
    },
  })
})
