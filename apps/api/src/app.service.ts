import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'ruta-api',
      timestamp: new Date().toISOString(),
    };
  }
}
