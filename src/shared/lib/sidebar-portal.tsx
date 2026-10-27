import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";

type SidebarPortalContextValue = {
	host: HTMLElement | null;
	setHost: (node: HTMLElement | null) => void;
};

const SidebarPortalContext = createContext<SidebarPortalContextValue | null>(
	null,
);

export function SidebarPortalProvider({ children }: { children: ReactNode }) {
	const [host, setHostState] = useState<HTMLElement | null>(null);
	const setHost = useCallback((node: HTMLElement | null) => {
		setHostState(node);
	}, []);
	const value = useMemo(() => ({ host, setHost }), [host, setHost]);

	return (
		<SidebarPortalContext.Provider value={value}>
			{children}
		</SidebarPortalContext.Provider>
	);
}

export function useSidebarPortalHost(): SidebarPortalContextValue {
	const context = useContext(SidebarPortalContext);
	if (!context) {
		throw new Error(
			"useSidebarPortalHost must be used within SidebarPortalProvider",
		);
	}
	return context;
}

/** Renders children into the app-shell sidebar host via react-dom createPortal. */
export function SidebarPortal({ children }: { children: ReactNode }) {
	const { host } = useSidebarPortalHost();
	if (!host) {
		return null;
	}
	return createPortal(children, host);
}
