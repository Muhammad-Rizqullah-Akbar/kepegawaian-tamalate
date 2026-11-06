import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATE_BROWSERS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter((p): p is string => Boolean(p));

@Injectable()
export class PdfService {
  resolveExecutablePath(): string | null {
    for (const candidate of CANDIDATE_BROWSERS) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  async renderHtmlToPdf(html: string): Promise<Buffer> {
    const executablePath = this.resolveExecutablePath();
    if (!executablePath) {
      throw new Error('No local Chromium/Chrome/Edge binary found for Puppeteer PDF rendering');
    }
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '20mm' },
      });
      return Buffer.from(pdfBytes);
    } finally {
      await browser.close();
    }
  }

  async checkHealth(): Promise<{ ok: boolean; executablePath: string | null }> {
    const executablePath = this.resolveExecutablePath();
    return {
      ok: executablePath !== null,
      executablePath,
    };
  }
}
