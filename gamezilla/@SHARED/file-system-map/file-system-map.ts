export class MapFileSystem<TKey, TValue> extends Map<TKey, TValue> {
  private directory: string

  constructor({ directory }: { directory: string; filename: string }) {
    super()
    this.directory = directory
  }

  private writeFile() {
    console.log("writeFile", this.directory)
  }

  override clear(): void {
    super.clear()
    this.writeFile()
  }

  override delete(key: TKey) {
    const deleted = super.delete(key)
    this.writeFile()
    return deleted
  }

  override get(key: TKey) {
    return super.get(key)
  }

  override has(key: TKey) {
    return super.has(key)
  }

  override set(key: TKey, value: TValue) {
    const set = super.set(key, value)
    this.writeFile()
    return set
  }

  override entries() {
    return super.entries()
  }

  override forEach(
    callbackfn: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void,
    thisArg?: any,
  ) {
    return super.forEach(callbackfn, thisArg)
  }

  override keys() {
    return super.keys()
  }

  override get size() {
    return super.size
  }

  override values() {
    return super.values()
  }
}
