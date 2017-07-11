
let _getSettings = true
export default {
  _getSettings () {
    return _getSettings
  },
  _dontGetSettings () {
    _getSettings = false
  }
}
