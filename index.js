const fs = require('fs')
const fetch = require('node-fetch')

// file with HAR from browser's network
const filename = 'metamaskNetworkHAR.har'

const RPCList = [
  'https://harmony-0-rpc.gateway.pokt.network',
  'https://api.s0.t.hmny.io',
  'https://a.api.s0.t.hmny.io',
];

(async () => {
  try {

    const queryRPC = async (rpcUrl, entries) => {
      let id = 1
      const query = async (entry) => {
        const request = entry.request

        const json = JSON.parse(request.postData.text)

        // query for latest block
        if (json.method === 'eth_call') {
          json.params = [json.params[0], 'latest']
        }

        json.id = id
        id++

        const r = await fetch(rpcUrl, {
          method: request.method,
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(json),

        }).then(r => r.json())

        if (r.error) {
          console.log(rpcUrl, json, r)
          throw new Error(JSON.stringify(r.error))
        }
        return r
      }

      const requests = entries.filter(
          e => e._resourceType === 'fetch')

      await Promise.all(requests.map(query))

      console.log(`${rpcUrl} ${requests.length} requests finished`)
    }

    let jsonData = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    for (let rpcUrl of RPCList) {
      await queryRPC(rpcUrl, jsonData.log.entries)
    }

    process.exit(0)
  } catch (e) {
    console.error('Failed', e)
    process.exit(1)
  }
})()