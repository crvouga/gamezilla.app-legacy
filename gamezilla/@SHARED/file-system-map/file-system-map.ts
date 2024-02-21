export class MapFileSystem extends Map {
  private directory: string

  constructor({ directory }: { directory: string; filename: string }) {
    super()
    this.directory = directory
  }

  private writeFile() {
    console.log(this.directory)
  }

  override clear(): void {
    super.clear()
    this.writeFile()
  }

  override delete(key: any): boolean {
    const deleted = super.delete(key)
    this.writeFile()
    return deleted
  }

  override get(key: any): any {
    return super.get(key)
  }

  override has(key: any): boolean {
    return super.has(key)
  }

  override set(key: any, value: any): this {
    const set = super.set(key, value)
    this.writeFile()
    return set
  }

  override entries(): IterableIterator<[any, any]> {
    return super.entries()
  }

  override forEach(
    callbackfn: (value: any, key: any, map: Map<any, any>) => void,
    thisArg?: any,
  ): void {
    super.forEach(callbackfn, thisArg)
  }

  override keys(): IterableIterator<any> {
    return super.keys()
  }

  override get size(): number {
    return super.size
  }

  override values(): IterableIterator<any> {
    return super.values()
  }
}
