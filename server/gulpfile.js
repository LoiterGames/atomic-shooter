const fs = require('fs')
const del = require('del')
const change = require('gulp-change-file-content')
const {src, watch, dest, series, parallel, task, log} = require('gulp')
const spawn = require('child_process').spawn
let node = null

const server = cb => {
    if (node) node.kill()
    node = spawn('node', ['src/server.js'], {stdio: 'inherit'})
    node.on('close', function (code) {
        if (code === 8) {
            log('Error detected, waiting for changes...');
        }
    });
    cb()
}

const reload_client = cb => {
    fs.writeFileSync('./reload_seed', Math.random().toString(), {encoding : "utf8"})
    cb()
}

const copy_shared = async () => {
    // await del(['../client/src/gen-shared'], {force : true})
    // fs.mkdirSync('../client/src/gen-shared')
    // return src(['./shared/**/*']).pipe(dest('../client/src/gen-shared'))
}

const watch_source = cb => {
    watch('./src/**/*.js', series(server, reload_client))
    watch('../shared/**/*.js', series(server, reload_client))

    cb()
}

exports.server = server
exports.reload_client = reload_client
exports.copy_shared = copy_shared
exports.default = series(server, copy_shared, watch_source)

process.on('exit', function() {
    if (node) node.kill()
})