import ThreeTest from "./three-test";

// const theResolve = () => {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve('resolved')
//         }, 2000)
//     })
// }
//
// const resolveAsync = async() => {
//     const result = await theResolve()
// }
//
// resolveAsync()

window.onload = () => {
    console.log('window loaded - starting threejs')
    new ThreeTest()
}
