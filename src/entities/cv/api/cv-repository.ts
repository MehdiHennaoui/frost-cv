import Dexie, { type EntityTable } from "dexie";

import type { Cv } from "../model/cv";

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
