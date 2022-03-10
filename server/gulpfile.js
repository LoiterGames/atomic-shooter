const fs = require('fs')
const del = require('del')
const {src, watch, dest, series, parallel, task, log} = require('gulp')
const spawn = require('child_process').spawn
let node = null

const remote_rsync = cb => {
    del.sync('./shooter-bundle', {force : true})

    src(['./**/*', '!node_modules/**', '!src/node_modules/**', '!reload_seed'])
        .pipe(dest('./shooter-bundle/server'))

    src(['../shared/**/**']).pipe(dest('./shooter-bundle/shared'))

    // const copyTask = spawn('scp', ['-r', './shooter-bundle', 'working-dog:~/'], {stdio : 'inherit'})
    // copyTask.on('close', code => {
    //     cb()
    // })
    // return copyTask

    const copyTask = spawn('rsync', ['-av', './shooter-bundle', 'working-dog:~/'], {stdio : 'inherit'})
    copyTask.on('close', code => {
        cb()
    })
    return copyTask
}

const remote_watch = cb => {
    watch('./src/**/*.js', series(remote_rsync))
    watch('../shared/**/*.js', series(remote_rsync, local_reload_client))

    cb()
}

exports.prepare_package = remote_rsync

const local_server = cb => {
    if (node) node.kill()
    node = spawn('node', ['src/server.js'], {stdio: 'inherit'})
    node.on('close', function (code) {
        if (code === 8) {
            log('Error detected, waiting for changes...');
        }
    });
    cb()
}

const local_reload_client = cb => {
    fs.writeFileSync('./reload_seed', Math.random().toString(), {encoding : "utf8"})
    cb()
}

const local_watch = cb => {
    watch('./src/**/*.js', series(local_server, local_reload_client))
    watch('../shared/**/*.js', series(local_server, local_reload_client))

    cb()
}

exports.start_local = series(local_server, local_watch)
exports.start_remote = series(remote_rsync, remote_watch)

process.on('exit', function() {
    if (node) node.kill()
})