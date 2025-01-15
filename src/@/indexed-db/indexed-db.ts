export const deleteDatabase = async (input: { dbName: string }) => {
  return new Promise((resolve, reject) => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(input.dbName)

      deleteRequest.onsuccess = () => {
        console.log(`Database '${input.dbName}' deleted successfully.`)
        resolve(null)
      }

      deleteRequest.onerror = (event) => {
        console.error(`Failed to delete database '${input.dbName}':`, event)
        reject(event)
      }

      deleteRequest.onblocked = () => {
        console.warn(`Deletion of database '${input.dbName}' is blocked. Close all connections and try again.`)
        resolve(null)
      }
    } catch (error) {
      console.error(`Error while deleting database '${input.dbName}':`, error)
      reject(error)
    }
  })
}
