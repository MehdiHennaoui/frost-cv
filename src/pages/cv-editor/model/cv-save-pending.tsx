import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

type CvSavePendingContextValue = {
	isCvSavePending: boolean;
	withCvSavePending: <T>(task: () => Promise<T>) => Promise<T>;
};

const CvSavePendingContext = createContext<CvSavePendingContextValue>({
	isCvSavePending: false,
	withCvSavePending: (task) => task(),
});

export function CvSavePendingProvider({ children }: { children: ReactNode }) {
	const [isCvSavePending, setIsCvSavePending] = useState(false);

	const withCvSavePending = useCallback(async <T,>(task: () => Promise<T>) => {
		setIsCvSavePending(true);
		try {
			return await task();
		} finally {
			setIsCvSavePending(false);
		}
	}, []);

	const value = useMemo(
		() => ({ isCvSavePending, withCvSavePending }),
		[isCvSavePending, withCvSavePending],
	);

	return (
		<CvSavePendingContext.Provider value={value}>
			{children}
		</CvSavePendingContext.Provider>
	);
}

export function useCvSavePending(): CvSavePendingContextValue {
	return useContext(CvSavePendingContext);
}
