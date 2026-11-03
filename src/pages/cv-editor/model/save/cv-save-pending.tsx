import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";

type WithCvSavePending = <T>(task: () => Promise<T>) => Promise<T>;

const CvSavePendingActionsContext = createContext<WithCvSavePending>((task) =>
	task(),
);
const CvSavePendingStateContext = createContext(false);

export function CvSavePendingProvider({ children }: { children: ReactNode }) {
	const [isCvSavePending, setIsCvSavePending] = useState(false);

	const withCvSavePending = useCallback<WithCvSavePending>(async (task) => {
		setIsCvSavePending(true);
		try {
			return await task();
		} finally {
			setIsCvSavePending(false);
		}
	}, []);

	return (
		<CvSavePendingActionsContext.Provider value={withCvSavePending}>
			<CvSavePendingStateContext.Provider value={isCvSavePending}>
				{children}
			</CvSavePendingStateContext.Provider>
		</CvSavePendingActionsContext.Provider>
	);
}

export function useWithCvSavePending(): WithCvSavePending {
	return useContext(CvSavePendingActionsContext);
}

export function useIsCvSavePending(): boolean {
	return useContext(CvSavePendingStateContext);
}
