import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useMemo, useState } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { ReactPdfCanadianDocument } from "./react-pdf-canadian-document";

type ReactPdfPreviewProps = {
	cv: Cv;
};

const isVitest = import.meta.env.MODE === "test";

export function ReactPdfPreview({ cv }: ReactPdfPreviewProps) {
	const { t } = useAppTranslation();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const showViewer = mounted && !isVitest;
	// PDFViewer re-layouts and reloads its iframe whenever children is a new element.
	const document = useMemo(() => <ReactPdfCanadianDocument cv={cv} />, [cv]);

	return (
		<article
			aria-label={t("cvEditor.preview.label")}
			className="mx-auto flex h-full w-full max-w-[8.5in] flex-col"
			data-cv-preview
			data-react-pdf-preview
		>
			{showViewer ? (
				<PDFViewer
					showToolbar
					className="min-h-[11in] w-full flex-1 rounded-sm border border-black/10 bg-white shadow-sm"
					style={{
						border: "none",
						width: "100%",
						height: "100%",
						minHeight: "11in",
					}}
				>
					{document}
				</PDFViewer>
			) : (
				<div
					className={cn(
						"flex min-h-[11in] w-full items-center justify-center bg-white text-muted-foreground text-sm shadow-sm ring-1 ring-black/10",
					)}
					data-react-pdf-stub={isVitest ? "test" : "loading"}
				>
					{isVitest
						? "React PDF document preview"
						: "Loading React PDF preview…"}
				</div>
			)}
		</article>
	);
}
