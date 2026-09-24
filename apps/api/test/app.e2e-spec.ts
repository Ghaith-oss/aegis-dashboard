import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Server } from 'http';
describe('Aegis Realtime API Pipeline (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // We strictly apply the ValidationPipe here to mimic your main.ts setup.
    // Without this, the E2E test wouldn't trigger DTO defenses.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  describe('POST /api/realtime/simulate', () => {
    
    it('OWASP A01: Rejects missing authorization token', () => {
      return request(app.getHttpServer() as Server)
        .post('/api/realtime/simulate')
        .send({ sensor: 'Front Door', status: 'OPEN' })
        .expect(401); // Unauthorized
    });

    // Data-driven payload testing
    const badPayloads = [
      { sensor: 'Front Door' }, // missing status
      { status: 'OPEN' }, // missing sensor
      { sensor: '', status: 'OPEN' }, // empty string
      { sensor: 'Front Door', status: 'INVALID_STATUS' }, // fails DTO enum constraints
      { sensor: 123, status: 'OPEN' }, // wrong data type
      {}, // empty payload
    ];

    it.each(badPayloads)('OWASP A05: Rejects malformed payload: %j', (payload) => {
      return request(app.getHttpServer() as Server)
        .post('/api/realtime/simulate')
        .set('Authorization', 'aegis-secure-token-2026!')
        .send(payload)
        .expect(400); // Bad Request
    });

    it('Accepts a fully valid request and token', () => {
      return request(app.getHttpServer() as Server)
        .post('/api/realtime/simulate')
        .set('Authorization', 'aegis-secure-token-2026!')
        .send({ sensor: 'Front Door', status: 'OPEN' })
        .expect(201); // Created
    });
  });

  afterAll(async () => {
    await app.close();
  });
});