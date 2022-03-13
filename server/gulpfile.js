const fs = require('fs')
const del = require('del')
const rename = require('gulp-rename')
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

const pack_shared = async () => {
    const write_dir = '../client-pc/src'

    /**
     * @type {String}
     */
    const assetId = fs.readFileSync(write_dir + '/Shared.js', {encoding : "utf8"}).match(/\/\/assetId=\d+/)[0]

    console.log(assetId)

    const {babel} = require('@rollup/plugin-babel')
    const bundle  = await require('rollup').rollup({
        input : '../shared/index.js',
        plugins : [
            babel({
                presets : [['@babel/preset-env']],
                babelHelpers : 'bundled'
            })
        ],
    })

    await bundle.write({
        file : './temp-shared.js',
        format : 'cjs'
    })

    await src('./temp-shared.js').pipe(require('gulp-change-file-content')((content) => {
        return assetId + '\n' + content.replace(/.*exports.+\;/gi, '//--')
    })).pipe(rename('Shared.js')).pipe(dest(write_dir))

    return del('./temp-shared.js')
}
exports['pack-shared'] = pack_shared

const remote_watch = cb => {
    watch('./src/**/*.js', series(remote_rsync, local_reload_client))
    watch('../shared/**/*.js', series(remote_rsync, pack_shared))

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
exports.start_remote = series(remote_rsync, pack_shared, remote_watch)

process.on('exit', function() {
    if (node) node.kill()
})