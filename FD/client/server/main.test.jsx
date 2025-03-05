import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';

let app;

beforeAll(async () => {
    app = (await import('../server/main.js')).default;
});

describe('Express Server Tests', () => {
    it('should serve static files from the "dist" directory', async () => {
        const staticPath = path.join(process.cwd(), 'dist');
        const filePath = path.join(staticPath, 'index.html');

        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readFileSync').mockReturnValue('<html><body>Mock Page</body></html>');

        const response = await request(app).get('/some-static-file.js');

        expect(response.status).toBe(200);
    });

    it('should return index.html for all GET requests', async () => {
        const response = await request(app).get('/some-random-url');

        expect(response.status).toBe(200);
        expect(response.text).toContain('<html');
    });

});

afterAll(() => {
    vi.restoreAllMocks();
});
