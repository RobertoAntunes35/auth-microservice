export class BaseException extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = new.target.name;

    Error.captureStackTrace(this, this.constructor);

  }
}
