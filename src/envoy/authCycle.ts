import dotenv from 'dotenv'
dotenv.config()
import respCookieParser from 'set-cookie-parser'
const { ENVOY_EMAIL, ENVOY_PASSWORD } = process.env

import _fetch from 'node-fetch'

import ScheduledEmployeesQuery from './gql/ScheduledEmployees'
import type { ScheduledEmployeesResults } from './types/ScheduledEmployeesResults'

function fetch (url, ...args) {
  logger.info('Requesting ' + url)
  return _fetch(url, ...args)
}

const API_BASE_URL = 'https://app.envoy.com'

const Envoy = {
  async suite () {
    let resp = await fetch(
      API_BASE_URL +
        `/a/visitors/api/v2/users/lookup?email=${encodeURIComponent(
          ENVOY_EMAIL
        )}`
    ).then(r => r.json())
    console.log(resp)

    Envoy.auth()
  },

  async auth () {
    let resp = await fetch(API_BASE_URL + `/a/auth/v0/token`, {
      method: 'POST',
      body: new URLSearchParams({
        company_id: null,
        username: ENVOY_EMAIL,
        password: ENVOY_PASSWORD,
        scope: [
          'first_party',
          'identity.basic',
          'public',
          'token.refresh'
        ].join(','),
        grant_type: 'password',
        client_id: '3e066b50-6598-11e7-a07a-db7aca4729b6'
      })
    })

    if (resp.status === 200) {
      const accessToken = respCookieParser
        .parse(resp.headers.raw()['set-cookie'])
        .find(({ name }) => name == 'access_token')?.value
      if (!accessToken)
        throw new Error('Could not parse access token from success result')
      return accessToken
    } else {
      let json = await resp.json()
      logger.error(`Failed to authenticate to Envoy: ${json.error}`)
      return null
    }
  },

  async fetchScheduling (access_token?: string) {
    if (!access_token) access_token = await Envoy.auth()
    if (!access_token) throw new Error('Could not authenticate to Envoy')

    let responses: ScheduledEmployeesResults[] = []

    do {
      const resp: ScheduledEmployeesResults = await fetch(
        API_BASE_URL + '/a/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + access_token
          },
          body: JSON.stringify({
            query: ScheduledEmployeesQuery,
            variables: {
              locationID: '98589',
              date: '2021-11-25',
              query: '',
              page: responses.length + 1,
              size: 100,
              scheduled: true
            }
          })
        }
      ).then(r => r.json())
      responses.push(resp)
    } while (
      responses[responses.length - 1].data.scheduledEmployees.pagination
        .nextPage !== null
    )

    const scheduledEmployees = responses
      .map(r => r.data.scheduledEmployees.scheduledEmployees)
      .flat()

    return scheduledEmployees.map(
      ({ name, email, desk }) => ({
        name,
        email,
        location: desk?.name,
        floor: desk?.floor?.name
      })
    )
  }
}

export default Envoy
