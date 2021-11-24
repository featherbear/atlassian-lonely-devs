import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const storageFile = "users.json"
const storageBasePath = join(__dirname, 'data')
const storagePath = join(storageBasePath, storageFile)

console.debug("Using configuration file located at " + storagePath)

export default new class {
    #data: Set<string>;
    constructor() {
        this.#data = new Set(existsSync(storagePath) ? JSON.parse(readFileSync(storagePath, 'utf8')) : [])
    }

    #save() {
        if (!existsSync(storageBasePath)) mkdirSync(storageBasePath, { recursive: true })
        writeFileSync(storagePath, JSON.stringify(Array.from(this.#data)), 'utf8')
    }
    add(email: string) {
        this.#data.add(email)
        this.#save()
    }

    remove(email: string) {
        this.#data.delete(email)
        this.#save()
    }

    check(email) {
        return this.#data.has(email)
    }
}