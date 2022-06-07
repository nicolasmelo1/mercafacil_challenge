/**
 * Retrieves if a given path is available and exists in the project.
 * 
 * @returns {boolean} - Returns either true or false weather it is available or not.
 */
function doesModuleExist(path) {
    try {
        require.resolve(path)
        return true
    } catch (e) {
        return false
    }
}

module.exports = doesModuleExist