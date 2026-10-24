import Dexie, { type EntityTable } from "dexie";

import {
	type CreateCvInput,
	type Cv,
	createCvInputSchema,
	createEmptyCvContent,
} from "../model/cv";

const DB_NAME = "frost-cv";

type FrostCvDb = Dexie & {
	cvs: EntityTable<Cv, "id">;
};

function createDatabase(): FrostCvDb {
	const db = new Dexie(DB_NAME) as FrostCvDb;
	db.version(1).stores({
		cvs: "id, updatedAt, title, locale",
	});
	return db;
}

let db: FrostCvDb = createDatabase();

export async function listCvs(): Promise<Cv[]> {
	const cvs = await db.cvs.orderBy("updatedAt").reverse().toArray();
	return cvs;
}

export async function createCv(input: CreateCvInput): Promise<Cv> {
	const parsed = createCvInputSchema.safeParse(input);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message ?? "Could not create CV");
	}

	const now = Date.now();
	const cv: Cv = {
		id: crypto.randomUUID(),
		title: parsed.data.title,
		locale: parsed.data.locale,
		content: createEmptyCvContent(),
		createdAt: now,
		updatedAt: now,
	};
	await db.cvs.put(cv);
	return cv;
}

/** Test / seed helper — not required for list UI. */
export async function putCv(cv: Cv): Promise<string> {
	const id = await db.cvs.put(cv);
	return id;
}

/** Clears IndexedDB between tests. */
export async function resetCvDatabase(): Promise<void> {
	db.close();
	await Dexie.delete(DB_NAME);
	db = createDatabase();
}
