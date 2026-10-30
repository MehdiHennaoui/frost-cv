import { type Cv, cvDownloadStem } from "@/entities/cv";

/** Opens the browser print dialog using the CV download stem as the document title. */
export function printCv(cv: Cv): void {
	const previousTitle = document.title;
	document.title = cvDownloadStem(cv);
	const restore = () => {
		document.title = previousTitle;
		window.removeEventListener("afterprint", restore);
	};
	window.addEventListener("afterprint", restore);
	window.print();
}
