import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSeedProblems } from "@/lib/practice/problems";
import type { Problem } from "@/lib/practice/types";
import { hydrateProblem } from "@/lib/practice/utils";

const dataRoot = path.join(process.cwd(), "data", "practice");
const problemsPath = path.join(dataRoot, "problems.json");

type JsonReadResult<T> =
  | { status: "missing" }
  | { status: "ok"; value: T };

async function ensureDataRoot() {
  await mkdir(dataRoot, { recursive: true });
}

function fileLabel(filePath: string) {
  return path.relative(process.cwd(), filePath) || filePath;
}

function jsonError(filePath: string, message: string) {
  return new Error(`${fileLabel(filePath)}: ${message}`);
}

async function readJsonFile<T>(filePath: string): Promise<JsonReadResult<T>> {
  try {
    const raw = await readFile(filePath, "utf8");
    try {
      return { status: "ok", value: JSON.parse(raw) as T };
    } catch (error) {
      throw jsonError(
        filePath,
        error instanceof Error ? `Invalid JSON (${error.message})` : "Invalid JSON"
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return { status: "missing" };
    }

    throw error;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureDataRoot();
  const tempPath = `${filePath}.${crypto.randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(tempPath, filePath);
}

export async function loadProblems(): Promise<Problem[]> {
  await ensureDataRoot();
  const raw = await readJsonFile<unknown>(problemsPath);

  if (raw.status === "missing") {
    const seeded = getSeedProblems();
    await saveProblems(seeded);
    return seeded;
  }

  if (!Array.isArray(raw.value)) {
    throw jsonError(problemsPath, "Expected an array of problems.");
  }

  return raw.value.map((problem) => hydrateProblem(problem));
}

export async function saveProblems(problems: Problem[]) {
  await writeJsonFile(problemsPath, problems);
}
