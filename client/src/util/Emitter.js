// export class Emitter {
//
//     dictionary = null
//
//     constructor(dict) {
//         this.dictionary = dict
//     }
//
//
// }

/**
 * @param dictionary
 * @return {{clear(*): void, emit(*, ...[*]=): void, on(*, *=): void}}
 * @constructor
 */
export const Emitter = (dictionary = {}) => {
    return {
        on(event, callback) {
            if (event in dictionary) {
                dictionary[event].push(callback)
            } else {
                dictionary[event] = [callback]
            }
        },

        clear(event) {
            if (event in dictionary) delete dictionary[event]
        },

        emit(event, ...args) {
            if (event in dictionary) {
                dictionary[event].forEach(cb => cb.apply(null, args))
            }
        }
    }
}