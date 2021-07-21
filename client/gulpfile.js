const fs = require('fs')

const {src, watch, dest, series, parallel, task} = require('gulp')

const clean = cb=>require('rimraf')('build/', cb)
const create_build_dir = cb => fs.mkdir('build', cb)

const rollup = async () => {
    // console.log(require('rollup-plugin-swc').default())
    const bundle  = await require('rollup').rollup({
        input : './src/index.js',
        plugins : [
            require('@rollup/plugin-node-resolve').nodeResolve(),
            require('@rollup/plugin-commonjs')({include : 'node_modules/**'}),
            require('rollup-plugin-swc').default({
                jsc: {
                    parser : {
                        syntax : 'ecmascript',
                        topLevelAwait: true
                    },
                    target : 'es2016',
                    externalHelpers : false,
                    keepClassNames : true
                },
                sourceMaps : true,
                minify : true
            })
        ]
    })

    await bundle.write({
        file : 'build/bundle.js',
        format : 'cjs',
        sourcemap : true
    })
}

const deploy_html = () => src('./index.html').pipe(dest('./build'))
const deploy_favicon = () => src('./favicon/**/*').pipe(dest('./build/'))

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
    watch(['./favicon/**/*'], series(deploy_favicon, dev_server_reload))
    // watch('css/**/*.styl', series(deploy_styles, dev_server_reload))
    // watch('assets/**/*', series(deploy_assets, dev_server_reload))
    cb()
}

exports.default = series(
    clean,
    create_build_dir,
    parallel(rollup, deploy_html/*, deploy_assets, deploy_styles*/, deploy_favicon, dev_server),
    watch_all
)