var pkg = require('../package.json')
var h5_env = process.env.H5_ENV || pkg.config && pkg.config.env || 'prod' // h5 环境变量


var fatConfigs = {
    'restfullApi': '',
    'jsBaseUrl':'src/',
    'baseUrl':'/static/',
    'resourceUrl':'/'
}
var prodConfigs = {
    'restfullApi': 'http://m.ctrip.com/restapi/soa2',
    'webresourceRootUrl':'//webresource.c-ctrip.com/'
}

var collection = {
    fat: fatConfigs,
    prod: prodConfigs,
}

module.exports = collection[h5_env.toLowerCase() || 'prod']
