import excludeFields from '../../util/excludeFields'
import { algoliaApiKey, algoliaApplicationId, algoliaIndexName } from '../../util/secrets'
const algoliasearch = require('algoliasearch')

interface Response {
  objectID: string
}

/**
 *
 * ##  Algolia Search Module ʲˢ
* Impl of Algolia for Event Yetu Repo

@example

const algolia = new AlgoliaSearch()
// Add a record to the index
algolia.uploadRecord(record)
 */
class AlgoliaSearch {
  private readonly client: any
  readonly index: any
  constructor () {
    this.client = algoliasearch(algoliaApplicationId, algoliaApiKey)
    this.index = this.client.initIndex(algoliaIndexName);
    (() => {
      void this.checkIfIndexHasSearchableAttributes().then((res) => { // we'll update this to check between the existing list and the one in algolia
        if (!res) {
          this.createSearchableAttributes()
        }
      })
    })()
  }

  /**
   *
   * @param record - this is a response from creating or updating an event
   * @returns void
   * Use it to either create or fully update everything in an existing record
   */
  uploadRecord (record: any): void {
    // we link the record's id with the object id for updates
    const tempRecord = { ...record } // prevent modifying the record
    tempRecord.objectID = tempRecord?.id?.toString()
    const recordToSend = excludeFields(tempRecord, ['creatorId', 'creationDate', 'bookingId', 'draft', 'updateTime'])
    this.index.saveObject(recordToSend).then(({ objectID }: Response) => {
      console.log('Object indexed:', objectID)
    }).catch((error: Error) => {
      console.error('Error indexing object:', error)
    })
  }

  /**
   *
   * @param objectID
   * Deletes a record from our index
   */
  removeRecord (objectID: string) {
    this.index.deleteObject(objectID).then(({ objectID }: Response) => {
      console.log('Object successfully removed from index', objectID)
    }).catch((error: Error) => {
      console.error('Error removing object from index:', error)
    })
  }

  /**
   *
   * @returns boolean
   * Checks to see if we have already existing searchable attributes in our index
   */
  private async checkIfIndexHasSearchableAttributes (): Promise<boolean> {
    try {
      const settings = await this.index.getSettings()
      const searchableAttributes: string[] = settings.searchableAttributes
      return searchableAttributes?.length > 0
    } catch (error) {
      console.error('Error checking searchable attributes existence:', error)
      return false
    }
  }

  /**
   * Creates searchable attributes
   */
  private createSearchableAttributes (): void {
    this.index.setSettings({
      searchableAttributes: [
        'title,description',
        'categories,tags',
        'location,city,country'
      ]
    }).then(() => {
      console.log('Searchable Attributes Created')
    }).catch((error: Error) => {
      console.error('Failed to create searchable attributes', error)
    })
  }
}

export default AlgoliaSearch
