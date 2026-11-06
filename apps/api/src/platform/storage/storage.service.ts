import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'node:crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly log = new Logger(StorageService.name);
  public readonly client: S3Client;
  public readonly bucketArsip: string;
  public readonly bucketDossier: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT ?? 'http://127.0.0.1:9000';
    const accessKeyId = process.env.S3_ACCESS_KEY ?? 'minioadmin';
    const secretAccessKey = process.env.S3_SECRET_KEY ?? 'minioadmin123';
    this.bucketArsip = process.env.S3_BUCKET_ARSIP ?? 'arsip';
    this.bucketDossier = process.env.S3_BUCKET_DOSSIER ?? 'dossier';

    this.client = new S3Client({
      region: 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBuckets();
  }

  async ensureBuckets(): Promise<void> {
    for (const bucket of [this.bucketArsip, this.bucketDossier]) {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
          this.log.log('Bucket S3 dibuat: ' + bucket);
        } catch (err) {
          this.log.warn('Gagal memastikan bucket ' + bucket + ': ' + (err instanceof Error ? err.message : String(err)));
        }
      }
    }
  }

  async putObject(bucket: string, key: string, body: Buffer | Uint8Array | string, contentType = 'application/octet-stream'): Promise<{ bucket: string; key: string; sha256: string }> {
    const buf = typeof body === 'string' ? Buffer.from(body, 'utf-8') : Buffer.from(body);
    const sha256 = createHash('sha256').update(buf).digest('hex');
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ContentType: contentType,
        Metadata: { sha256 },
      }),
    );
    return { bucket, key, sha256 };
  }

  async presignedGetUrl(bucket: string, key: string, expiresInSeconds = 900): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async checkHealth(): Promise<{ ok: boolean; latencyMs: number; buckets: readonly string[] }> {
    const start = Date.now();
    try {
      const res = await this.client.send(new ListBucketsCommand({}));
      const names = (res.Buckets ?? []).map((b) => b.Name ?? '').filter(Boolean);
      return { ok: true, latencyMs: Date.now() - start, buckets: names };
    } catch {
      return { ok: false, latencyMs: Date.now() - start, buckets: [] };
    }
  }
}
