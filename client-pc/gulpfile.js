const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const del = require('del')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * @type {{
 * project_id:string,
 * project_branch:string,
 * api_token:string,
 * dir_local:string,
 * dir_remote:string,
 * swap_file_id:string,
 * swap_file_address:string
 * }} Config
 */
const config = JSON.parse(fs.readFileSync('./project-settings.json', {encoding : 'utf-8'}))

const {src, watch, dest, series, parallel, task} = require('gulp')

const getJSON = async request => {
    return await fetch(`https://playcanvas.com${request}`, {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${config.api_token}`
        }
    }).then(response => response.json())
}

const getText = async request => {
    return await fetch(`https://playcanvas.com${request}`, {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${config.api_token}`
        }
    }).then(response => response.text())
}

const updateFile = async (stream, assetId) => {

    const form = new FormData()
    form.append('file', stream)
    // form.append('branchId', config.project_branch)

    return await fetch(`https://playcanvas.com/api/assets/${assetId}`, {
        method : 'PUT',
        body : form,
        headers : {
            'Authorization' : `Bearer ${config.api_token}`
        }
    }).then(response => response.json())
}

const createFile = async (stream, name, parent) => {

    const defaultParent = JSON.parse(fs.readFileSync('./local-asset-data.json', {encoding: 'utf-8'}))[0].id
    const form = new FormData()
    form.append('name', name)
    form.append('projectId', config.project_id)
    form.append('branchId', config.project_branch)
    form.append('parent', parent ?? defaultParent)
    form.append('preload', 'true')
    form.append('file', stream)

    return await fetch(`https://playcanvas.com/api/assets`, {
        method : 'POST',
        body : form,
        headers : {
            'Authorization' : `Bearer ${config.api_token}`
        }
    }).then(response => response.json())
}

const writeFileWithMetadata = (fileContents, assetId, relativePath) => {
    if (fileContents.indexOf('//assetId=') === -1) {
        fileContents = `//assetId=${assetId}\n` + fileContents
    } else {
        fileContents = fileContents.replace(/\/\/assetId=\d+\n/, `//assetId=${assetId}\n`)
    }
    fs.writeFileSync(relativePath, fileContents)
}

const saveAssets = async (assets, folderId, relativePath, localMetaData) => {
    if (!fs.existsSync(relativePath)) {
        fs.mkdirSync(relativePath)
    }

    if (localMetaData.length === 0) {
        localMetaData.push({
            "id": folderId,
            "file": null,
            "name": "remote-scripts",
            "type": "folder",
            "parent": null
        })
    }

    const assetsInFolder = assets.filter(x => x.parent === folderId)

    for (let i = 0; i < assetsInFolder.length; i++) {
        const a = assetsInFolder[i]
        if (a.type === 'folder') {
            localMetaData.push(a)
            await saveAssets(assets, a.id, path.join(relativePath, a.name), localMetaData)
            continue
        }

        console.log(`will save file at ${relativePath}/${a.name}`)

        if (a.type === 'script') {
            let contents = await getText(a.file.url)
            writeFileWithMetadata(contents, a.id, path.join(relativePath, a.file.filename))
        } else {
            console.log(`type ${a.type} is not supported `)
        }
    }
}

exports['download-all'] = async () => {

    const partialAssetList = await getJSON(`/api/projects/${config.project_id}/assets?branchId=${config.project_branch}`)
    const assetNumber = partialAssetList.pagination.total

    const allAssetsR = await getJSON(`/api/projects/${config.project_id}/assets?branchId=${config.project_branch}&skip=0&limit=${assetNumber}`)
    const allAssets = allAssetsR.result;

    //
    // find remote folder
    const folders = allAssets.filter(x => x.type === 'folder')
    let remoteFolder = null;
    for (let i = 0; i < folders.length; i++) {
        if (folders[i].name === config.dir_remote && folders[i].parent === null) {
            console.log(`found remote folder: ${folders[i].name}`)
            remoteFolder = folders[i]
        }
    }
    if (remoteFolder === null) {
        console.log(`remote folder ${config.dir_remote} not found`)
        // todo: create remote folder?
        return;
    }

    const localMetaData = []
    await saveAssets(allAssets, remoteFolder.id, config.dir_local, localMetaData)

    fs.writeFileSync("local-asset-data.json", JSON.stringify(localMetaData))
}

exports.default = async () => {

    // TODO: what ui textures?
    const folder = './src'

    await del(folder)

    fs.mkdirSync(folder)

    const partialAssetList = await getJSON(`/api/projects/${config.project_id}/assets?branchId=${config.project_branch}`)
    const totalAssets = partialAssetList.pagination.total

    const allAssetsR = await getJSON(`/api/projects/${config.project_id}/assets?branchId=${config.project_branch}&skip=0&limit=${totalAssets}`)
    const allAssets = allAssetsR.result;

    // const allTextures = allAssets.filter(x => x.type === 'texture')
    //
    // const allUITextures = allTextures.filter(x => {
    //     const parentFolder = allAssets.filter(asset => asset.id === x.parent)[0]
    //     return parentFolder.name.indexOf('UI') > -1
    // })
    //
    // for (let i = 0; i < allUITextures.length; i++) {
    //     const uiTextureData = allUITextures[i]
    //     let contents = await getText(uiTextureData.file.url)
    //     writeFileWithMetadata(contents, a.id, path.join(folder, a.file.filename))
    //     // await saveAssets(allAssets, remoteFolder.id, config.dir_local, localMetaData)
    // }

    // const folders = allAssets.filter(x => x.type === 'folder')
    // let remoteFolder = null;
    // for (let i = 0; i < folders.length; i++) {
    //     if (folders[i].name === config.dir_remote && folders[i].parent === null) {
    //         console.log(`found remote folder: ${folders[i].name}`)
    //         remoteFolder = folders[i]
    //     }
    // }
    // if (remoteFolder === null) {
    //     console.log(`remote folder ${config.dir_remote} not found`)
    //     // todo: create remote folder?
    //     return;
    // }
    //
    // const localMetaData = []
    // await saveAssets(allAssets, remoteFolder.id, config.dir_local, localMetaData)
    //
    // fs.writeFileSync("local-asset-data.json", JSON.stringify(localMetaData))
}

exports['watch-all'] = async () => {
    const watcher = watch(`${config.dir_local}/**/*.js`)

    let writeInProcess = false
    let list = []
    let timeout = null
    let queue = []

    const writeAllChanges = async () => {
        writeInProcess = true
        console.log('will update files:', list.map(x => x[1]))
        /**
         * @type {string}
         */
        const swapContents = fs.readFileSync(config.swap_file_address, {encoding:'utf-8'})
        const newContents = swapContents.replace(/\/\/randomValue =.*\n/gi, `//randomValue = ${Math.random()}\n`)
        fs.writeFileSync(
            config.swap_file_address,
            newContents,
            {encoding:'utf-8'})
        list.push([config.swap_file_id, config.swap_file_address])

        for (let i = 0; i < list.length; i++) {
            const assetId = list[i][0]
            const assetPath = list[i][1]

            await updateFile(fs.createReadStream(assetPath), assetId)
        }


        if (queue.length) {
            list = queue
            queue = []
            timeout = setTimeout(writeAllChanges, 200)
        } else {
            list = []
            timeout = null
        }
        writeInProcess = false
    }

    watcher.on('change', async (path, stats) => {
        // if (path.contains('ReloadBySwap')) return;

        const file = fs.readFileSync(path, {encoding: 'utf-8'})
        const match = file.match(/^\/\/assetId=.+/)
        if (match === null) return;
        const assetId = match[0].split('=')[1]

        if (assetId === config.swap_file_id) return;

        if (writeInProcess) {
            queue.push([assetId, path])
            return;
        }

        clearTimeout(timeout)

        let needToPush = true
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === assetId) {
                needToPush = false
                break
            }
        }

        if (needToPush) {
            list.push([assetId, path])
        }

        timeout = setTimeout(writeAllChanges, 200)

        // await updateFile(fs.createReadStream(path), assetId)
    })

    // TODO : support creating scripts for now
    // watcher.on('add', async (_path, stats) => {
    //     console.log(`file ${_path} was added`)
    //     const file = fs.readFileSync(_path, {encoding: 'utf-8'})
    //     const match = file.match(/^\/\/assetId=.+/)
    //     if (match === null) {
    //         console.log(`new asset has been created`)
    //         const pathArray = _path.split(path.sep)
    //         const fileName = pathArray[pathArray.length-1]
    //         // if (pathArray.length === 2) { // created file in root directory
    //         //     response = createFile(fs.createReadStream(_path), fileName)
    //         // } else {
    //         const folderData = JSON.parse(fs.readFileSync('./local-asset-data.json', {encoding: 'utf-8'}))
    //
    //         // src-temp/some.js
    //         // src-temp/ui/some.js
    //         const findCorrectFolder = (idx, _pathArray, _folderData) => {
    //             const folder = _pathArray[idx]
    //
    //             if (idx === _pathArray.length-1) return null
    //
    //             const remoteFolders = _folderData.filter(x => x.name === folder)
    //
    //             for (let i = remoteFolders.length-1; i >= 0; i--) {
    //                 let folderPath = 0
    //                 const targetPath = idx
    //                 let parentId = remoteFolders[i].parent
    //                 while (true) {
    //                     const parentNode = _folderData.filter(x => x.id === parentId)[0]
    //                     folderPath += 1
    //                     if (parentNode.parent === null) {
    //                         break
    //                     } else {
    //                         parentId = parentNode.parent
    //                     }
    //                 }
    //
    //                 if (folderPath > targetPath) {
    //                     remoteFolders.splice(i, 1)
    //                 }
    //             }
    //
    //             if (remoteFolders.length !== 1) throw 'cannot parse duping folders right now'
    //
    //             if (idx < _pathArray.length-2) {
    //                 return findCorrectFolder(idx++, _pathArray, _folderData)
    //             } else {
    //                 return remoteFolders[0].id
    //             }
    //         }
    //
    //         const parentId = findCorrectFolder(1, pathArray, folderData)
    //         // console.log(`file ${_path} should be saved with parent ${parentId}`)
    //         const response = await createFile(fs.createReadStream(_path), fileName, parentId)
    //
    //         console.log(`file ${_path} saved with id ${response.id}`)
    //         writeFileWithMetadata(file, response.id, _path)
    //     } else {
    //         const assetId = match[0].split('=')[1]
    //         console.log(`asset ${assetId} has been renamed`)
    //     }
    // })

    return watcher
}