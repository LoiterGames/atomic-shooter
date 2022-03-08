export default class Actor {

    /**
     * @return {ComponentView}
     */
    get view() { return this; }

    /**
     * @param view {ComponentView}
     */
    addView(view) {
        Object.assign(this, view)
        return this
    }
}