const fs = require('fs')
const fetch = require('node-fetch')

// file with HAR from browser's network
const filename = 'metamaskNetworkHAR.har';

(async () => {
  try {
    let jsonData = JSON.parse(fs.readFileSync(filename, 'utf-8'))

    const query = async () => {
      const request = entries[0].request

      const r = await fetch(request.url, {
        method: request.method,
        headers: {'content-type': 'application/json'},
        body: request.postData.text,

      }).then(r => r.json())

      console.log(request.url, request.postData.text, r)
      return r
    }

    const entries = jsonData.log.entries.filter(
        e => e._resourceType === 'fetch')

    await Promise.all(entries.map(query))

    console.log(`${entries.length} queries finished`)

    process.exit(0)
  } catch (e) {
    console.error('Failed with err', e)
    process.exit(1)
  }
})()