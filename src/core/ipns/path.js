'use strict'

const isIPFS = require('is-ipfs')

const debug = require('debug')
const log = debug('jsipfs:ipns:path')
log.error = debug('jsipfs:ipns:path:error')

const ERR_BAD_PATH = 'ERR_BAD_PATH'
const ERR_NO_COMPONENTS = 'ERR_NO_COMPONENTS'

// resolves the given path by parsing out protocol-specific entries
// (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
const resolvePath = (ipfsNode, name, callback) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    log(`resolve ipns path ${name}`)

    const local = true // TODO ROUTING - use self._options.local
    const parts = name.split('/')

    if (parts.length < 3 || parts[2] === '') {
      const errMsg = 'path must contain at least one component'

      log.error(errMsg)
      return callback(Object.assign(new Error(errMsg), { code: ERR_NO_COMPONENTS }))
    }

    const options = {
      local: local
    }

    return ipfsNode._ipns.resolve(name, ipfsNode._peerInfo.id, options, callback)
  }

  // ipfs path
  ipfsNode.dag.get(name.substring('/ipfs/'.length), (err, value) => {
    if (err) {
      return callback(err)
    }

    return callback(null, value)
  })
}

// parsePath returns a well-formed ipfs Path.
// The returned path will always be prefixed with /ipfs/ or /ipns/.
// If the received string is not a valid ipfs path, an error will be returned
const parsePath = (pathStr) => {
  if (isIPFS.cid(pathStr)) {
    return `/ipfs/${pathStr}`
  } else if (isIPFS.path(pathStr)) {
    return pathStr
  } else {
    throw Object.assign(new Error(`invalid 'ipfs ref' path`), { code: ERR_BAD_PATH })
  }
}

module.exports = {
  resolvePath,
  parsePath
}