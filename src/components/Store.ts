import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const storageFile = "users.json"
const storagePath = join(__dirname, storageFile)

export default new class {
    #data: Set<string>;
    constructor() {
        this.#data = new Set(existsSync(storagePath) ? JSON.parse(readFileSync(storagePath, 'utf8')) : [])    
    }

    #save() {
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