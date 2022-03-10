const fs = require('fs')

const {src, watch, dest, series, parallel, task} = require('gulp')

const clean = cb=>require('rimraf')('build/', cb)
const create_build_dir = cb => fs.mkdir('build', cb)

const rollup = async () => {
    const {babel} = require('@rollup/plugin-babel')
    const bundle  = await require('rollup').rollup({
        input : './src/index-new.js',
        plugins : [
            require('@rollup/plugin-node-resolve').nodeResolve({
                resolveOnly : [/(^(?!playcanvas).*$)/]
            }),
            require('@rollup/plugin-commonjs')({include : ['node_modules/**']}),
            babel({
                babelrc : false,
                presets : [['@babel/preset-env', {targets : {chrome : "59"}}]],
                babelHelpers : 'bundled'
            })
        ],
    })

    await bundle.write({
        file : 'build/bundle.js',
        format : 'cjs',
        sourcemap : true
    })

    return src('build/bundle.js').pipe(require('gulp-change-file-content')((content, path, file) => {
        return content
            .replace('var playcanvas = require(\'playcanvas\');', '')
            .replace('window.onload = async () => {', 'window.onload = async () => {\n  var playcanvas = pc;')
    })).pipe(dest('build'))
}

exports.rollup = rollup

const deploy_html = () => src('./index.html').pipe(dest('./build'))

const deploy_libraries = () => {
    return src('node_modules/playcanvas/build/playcanvas.min.js').pipe(dest('./build'))
}

// const deploy_favicon = () => src('./favicon/**/*').pipe(dest('./build/'))

const connect = require('gulp-connect')
const dev_server = cb => {
    connect.server({
        root : 'build',
        host : '0.0.0.0',
        port : 7070,
        livereload : true,
        debug : true
    })
    cb()
}
const dev_server_reload = () => src('build/index.html', {read:false}).pipe(connect.reload())

const watch_all = cb => {
    watch('./src/**/*.js', series(rollup, dev_server_reload))
    watch(['./index.html'], series(deploy_html, dev_server_reload))
    // watch(['./favicon/**/*'], series(deploy_favicon, dev_server_reload))
    watch(['../server/reload_seed'], dev_server_reload)
    // watch('css/**/*.styl', series(deploy_styles, dev_server_reload))
    // watch('assets/**/*', series(deploy_assets, dev_server_reload))
    cb()
}

exports.default = series(
    clean,
    create_build_dir,
    parallel(rollup, deploy_html, deploy_libraries/*, deploy_assets, deploy_styles, deploy_favicon*/, dev_server),
    watch_all
)