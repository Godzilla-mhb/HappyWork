'use strict'
// sh	上交所股票（基金）前缀
// s_sh	上交所股票（基金）前缀，省略五档报价等信息
// sz	深交所股票（基金）前缀
// s_sz	深交所股票（基金）前缀，省略五档报价等信息
var rp = require('request-promise')
const iconv = require('iconv-lite')

const url = 'http://hq.sinajs.cn/list='

export default {
  getData(code, callback) {
    var codeArr = code.split(',')

    var textAll = ''

    var promiseArr = codeArr.map(function (code) {
      let options = {
        url: url + 'sh' + code,
        headers: { referer: 'http://finance.sina.com.cn' },
        encoding: null,
      }
      return rp(options).then(function (buffer) {
        return iconv.decode(Buffer.from(buffer), 'GB18030')
      })
    })
    Promise.all(promiseArr)
      .then(function (results) {
        for (let index = 0; index < results.length; index++) {
          var arr = results[index].toString().split(',')
          var yesterday_price = parseFloat(arr[2])
          var curr_price = parseFloat(arr[3])
          var curr_name = arr[0].split('=')[1].replace(/\"/g, '')
          var percentage =
            ((curr_price - yesterday_price) / yesterday_price) * 100
          var text = curr_price.toFixed(2) + ',' + percentage.toFixed(2) + '%'
          textAll = textAll + curr_name + ':' + text + '||'
        }
        textAll = textAll.substring(0, textAll.length - 2)
        callback(textAll)
      })
      .catch(function (e) {
        console.log(e)
      })
  },
}
