const DB_NAME = 'trackerApp'
const DB_VERSION = 1
const STORES = {
  ITEMS: 'items',
  ASSESSMENTS: 'assessments'
}

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject(`Database error: ${event.target.errorCode}`)
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create ITEMS store if it doesn't exist
      if (!db.objectStoreNames.contains(STORES.ITEMS)) {
        const itemsStore = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' })
        itemsStore.createIndex('title', 'title', { unique: true })
      }

      // Create ASSESSMENTS store if it doesn't exist
      if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
        db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'item_id' })
      }
    }
  })
}



// ---------- ITEM FUNCTIONS ----------
export const getAllItems = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ITEMS, 'readonly')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (event) => {
      reject(`Error getting items: ${event.target.errorCode}`)
    }
  })
}

export const saveItem = async (item) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ITEMS, 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.put(item)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (event) => {
      reject(`Error saving item: ${event.target.errorCode}`)
    }
  })
}

export const saveItems = async (items) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ITEMS, 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)

    items.forEach(item => {
      store.put(item)
    })

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = (event) => {
      reject(`Error saving items: ${event.target.errorCode}`)
    }
  })
}

export const deleteItem = async (id) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ITEMS, 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject(`Error deleting item: ${event.target.errorCode}`)
    }
  })
}



// ---------- ASSESSMENTS FUNCTIONS ----------
export const getAllAssessments = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ASSESSMENTS, 'readonly')
    const store = transaction.objectStore(STORES.ASSESSMENTS)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (event) => {
      reject(`Error getting assessments: ${event.target.errorCode}`)
    }
  })
}

export const saveAssessment = async (assessment) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ASSESSMENTS, 'readwrite')
    const store = transaction.objectStore(STORES.ASSESSMENTS)
    const request = store.put(assessment)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (event) => {
      reject(`Error saving assessment: ${event.target.errorCode}`)
    }
  })
}

export const saveAssessments = async (assessments) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ASSESSMENTS, 'readwrite')
    const store = transaction.objectStore(STORES.ASSESSMENTS)

    assessments.forEach(assessment => {
      store.put(assessment)
    })

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = (event) => {
      reject(`Error saving assessments: ${event.target.errorCode}`)
    }
  })
}

export const deleteAssessment = async (itemID, entryID) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ASSESSMENTS, 'readwrite')
    const store = transaction.objectStore(STORES.ASSESSMENTS)
    const request = store.get(itemID)

    request.onsuccess = (e) => {
      const assessment = e.target.result

      if (!assessment) {
        reject(`Assessment with item_id: ${itemID} not found`)
        return
      }

      assessment.entries = assessment.entries.filter(entry => entry.id !== entryID)

      const updateRequest = store.put(assessment)

      updateRequest.onsuccess = () => {
        resolve()
      }

      updateRequest.onerror = (e) => {
        reject(`Assessment couldn't be updated: ${e.target.error}`)
      }
    }

    request.onerror = (event) => {
      reject(`Error deleting assessment entry: ${event.target.errorCode}`)
    }
  })
}