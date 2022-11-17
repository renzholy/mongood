type Host = {
  host: string
  port?: number | undefined
}

type ParserOptions = {
  scheme?: string
}

type UriObject = {
  scheme?: string
  hosts: Host[]

  username?: string | undefined
  password?: string | undefined
  database?: string | undefined
  options?: any
}

class MongodbUriParser {
  scheme?: string

  constructor(options: ParserOptions) {
    if (options && options.scheme) {
      this.scheme = options.scheme
    }
  }

  parse(uri: string): UriObject {
    const uriObject: UriObject = { hosts: [] }

    let i = uri.indexOf('://')
    if (i < 0) {
      throw new Error('No scheme found in URI ' + uri)
    }
    uriObject.scheme = uri.substring(0, i)
    if (this.scheme && this.scheme !== uriObject.scheme) {
      throw new Error('URI must begin with ' + this.scheme + '://')
    }
    let rest = uri.substring(i + 3)

    i = rest.indexOf('@')
    if (i >= 0) {
      const credentials = rest.substring(0, i)
      rest = rest.substring(i + 1)
      i = credentials.indexOf(':')
      if (i >= 0) {
        uriObject.username = decodeURIComponent(credentials.substring(0, i))
        uriObject.password = decodeURIComponent(credentials.substring(i + 1))
      } else {
        uriObject.username = decodeURIComponent(credentials)
      }
    }

    i = rest.indexOf('?')
    if (i >= 0) {
      const options = rest.substring(i + 1)
      rest = rest.substring(0, i)
      uriObject.options = {}
      options.split('&').forEach((o) => {
        const iEquals = o.indexOf('=')
        uriObject.options[decodeURIComponent(o.substring(0, iEquals))] =
          decodeURIComponent(o.substring(iEquals + 1))
      })
    }

    i = rest.indexOf('/')
    if (i >= 0) {
      // Make sure the database name isn't the empty string
      if (i < rest.length - 1) {
        uriObject.database = decodeURIComponent(rest.substring(i + 1))
      }
      rest = rest.substring(0, i)
    }

    this._parseAddress(rest, uriObject)

    return uriObject as UriObject
  }

  _parseAddress(address: string, uriObject: UriObject) {
    uriObject.hosts = []
    address.split(',').forEach((h) => {
      const i = h.indexOf(':')
      if (i >= 0) {
        uriObject.hosts.push({
          host: decodeURIComponent(h.substring(0, i)),
          port: parseInt(h.substring(i + 1)),
        })
      } else {
        uriObject.hosts.push({ host: decodeURIComponent(h) })
      }
    })
  }

  format(uriObject: UriObject) {
    if (!uriObject) {
      return (this.scheme || 'mongodb') + '://localhost'
    }

    if (this.scheme && uriObject.scheme && this.scheme !== uriObject.scheme) {
      throw new Error('Scheme not supported: ' + uriObject.scheme)
    }
    let uri = (this.scheme || uriObject.scheme || 'mongodb') + '://'

    if (uriObject.username) {
      uri += encodeURIComponent(uriObject.username)
      // While it's not to the official spec, we allow empty passwords
      if (uriObject.password) {
        uri += ':' + encodeURIComponent(uriObject.password)
      }
      uri += '@'
    }

    uri += this._formatAddress(uriObject)

    // While it's not to the official spec, we only put a slash if there's a database, independent of whether there are options
    if (uriObject.database) {
      uri += '/' + encodeURIComponent(uriObject.database)
    }

    if (uriObject.options) {
      Object.keys(uriObject.options).forEach((k, i) => {
        uri = uri + (i === 0 ? '?' : '&')
        uri =
          uri +
          encodeURIComponent(k) +
          '=' +
          encodeURIComponent(uriObject.options[k])
      })
    }

    return uri
  }

  _formatAddress(uriObject: UriObject) {
    let address = ''
    uriObject.hosts.forEach((h, i) => {
      if (i > 0) {
        address += ','
      }
      address += encodeURIComponent(h.host)
      if (h.port) {
        address += ':' + encodeURIComponent(h.port)
      }
    })
    return address
  }
}

export const mongodbUri = new MongodbUriParser({})
