//var test = require('tape')
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var tar = require('tar')
var zlib = require('zlib')

var archive = path.resolve(__dirname, 'node-webkit-v0.8.6-linux-x64.tar.gz')
var tmpdir = path.resolve(__dirname, 'tmp')
var tarfile = path.join(tmpdir, 'node-webkit-v0.8.6-linux-x64.tar')
var opts = { path: path.join(tmpdir, 'node-webkit') }
var timers = Object.create(null)

function cleanUp(done) {
  console.log('cleaning ' + tmpdir)
  rimraf(tmpdir, done)
}

function time(name) {
  var timer = timers[name]
  if (timer) {
    var diff = process.hrtime(timer)
    timers[name] = null
    console.log(name + ' took ' + ((diff[0] * 1e9 + diff[1]) * 0.000001).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'ms')
  } else {
    timers[name] = process.hrtime()
  }
}

function timeZlib(done) {
  time('zlib')
  var gzip = zlib.Unzip()
  var out = fs.createWriteStream(tarfile)
  out.on('close', function() {
    time('zlib')
    done()
  })
  fs.createReadStream(archive).pipe(gzip).pipe(out)
}

function timeTar(done) {
  time('tar')
  var untar = tar.Extract(opts)
  untar.on('close', function() {
    time('tar')
    done()
  })
  fs.createReadStream(tarfile).pipe(untar)
}

cleanUp(function() {
  fs.mkdirSync(tmpdir)
  timeZlib(function() {
    timeTar(function() {
      cleanUp(process.exit)
    })
  })
})
