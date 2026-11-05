import { createContext, type ReactNode, useContext, useState } from "react";

import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";

export type EntryDeleteConfirm = {
	title: string;
	description: string;
	cancelLabel: string;
	confirmLabel: string;
	onConfirm: () => void;
};

type EntryDeleteConfirmContextValue = {
	requestEntryDelete: (entryDeleteConfirm: EntryDeleteConfirm) => void;
};

const EntryDeleteConfirmContext =
	createContext<EntryDeleteConfirmContextValue | null>(null);

export function useEntryDeleteConfirm(): EntryDeleteConfirmContextValue {
	const value = useContext(EntryDeleteConfirmContext);
	if (!value) {
		throw new Error(
			"useEntryDeleteConfirm requires EntryDeleteConfirmProvider",
		);
	}
	return value;
}

export function EntryDeleteConfirmProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [entryDeleteConfirm, setEntryDeleteConfirm] =
		useState<EntryDeleteConfirm | null>(null);

	return (
		<EntryDeleteConfirmContext.Provider
			value={{
				requestEntryDelete: setEntryDeleteConfirm,
			}}
		>
			{children}
			{entryDeleteConfirm && (
				<CvDeleteConfirmDialog
					title={entryDeleteConfirm.title}
					description={entryDeleteConfirm.description}
					cancelLabel={entryDeleteConfirm.cancelLabel}
					confirmLabel={entryDeleteConfirm.confirmLabel}
					onCancel={() => {
						setEntryDeleteConfirm(null);
					}}
					onConfirm={() => {
						const { onConfirm } = entryDeleteConfirm;
						setEntryDeleteConfirm(null);
						onConfirm();
					}}
				/>
			)}
		</EntryDeleteConfirmContext.Provider>
	);
}
