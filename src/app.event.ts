export class CustomEvent {
  public static readonly baseName: string;

  constructor(
    public readonly payload: any,
    private readonly options?: { suffix?: string },
  ) {}

  get name() {
    const baseName: string = (this.constructor as typeof CustomEvent).baseName;
    const suffix: string | undefined = this.options?.suffix;

    return baseName + (suffix ? `.${suffix}` : '');
  }
}
