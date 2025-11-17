import "server-only";

import { v4 as uuid } from "uuid";

import { getRedis } from "@/lib/redis";

const mockKey = (id: string) => `mockcsv:${id}`;

interface MockCsvRecord {
  id: string;
  fileName: string;
  content: string;
  createdAt: string;
}

export const saveMockCsv = async (fileName: string, content: string) => {
  const redis = getRedis();
  const id = uuid();
  const record: MockCsvRecord = {
    id,
    fileName,
    content,
    createdAt: new Date().toISOString(),
  };
  await redis.set(mockKey(id), record, { ex: 60 * 60 * 24 }); // 24h ttl
  return record;
};

export const getMockCsv = async (id: string) => {
  const redis = getRedis();
  return (await redis.get<MockCsvRecord>(mockKey(id))) ?? null;
};

