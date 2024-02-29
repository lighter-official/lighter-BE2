import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe
  implements PipeTransform<string, string | number | object>
{
  transform(value: string): string | number | object {
    return JSON.parse(value);
  }
}

@Injectable()
export class ParseBooleanPipe
  implements PipeTransform<string | undefined, boolean>
{
  transform(value: string | undefined): boolean {
    return value === 'true' ? true : false;
  }
}
