import type { Cv } from "@/entities/cv";
import { sectionOrderOf } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { sanitizeCvHtml } from "@/shared/lib/sanitize-html";
import { identityFieldsOf } from "../model/identity-fields";

type CanadianCvPreviewProps = {
	cv: Cv;
};

export function CanadianCvPreview({ cv }: CanadianCvPreviewProps) {
	const { t } = useAppTranslation();
	const identity = identityFieldsOf(cv.content);
	const fullName = [identity.firstName, identity.lastName]
		.filter(Boolean)
		.join(" ");
	const order = sectionOrderOf(cv.content);
	const contacts = [
		identity.email,
		identity.phone,
		identity.postalCode,
		identity.linkedin,
		identity.github,
		identity.website,
	].filter(Boolean);
	const descriptionHtml = sanitizeCvHtml(identity.description);

	return (
		<article
			aria-label={t("cvEditor.preview.label")}
			className="mx-auto w-full max-w-[8.5in] bg-white text-black shadow-sm ring-1 ring-black/10"
			data-cv-preview
		>
			<div className="min-h-[11in] space-y-6 p-[0.6in] text-sm leading-relaxed">
				<header className="space-y-1 border-black border-b pb-3">
					<h1 className="font-semibold text-2xl tracking-tight">
						{fullName || t("cvEditor.preview.unnamed")}
					</h1>
					{identity.jobTitle && (
						<p className="text-base">{identity.jobTitle}</p>
					)}
					{contacts.length > 0 && (
						<ul className="flex flex-wrap gap-x-3 gap-y-1 text-neutral-700 text-xs">
							{contacts.map((value) => (
								<li key={value}>{value}</li>
							))}
						</ul>
					)}
					{descriptionHtml && (
						<div
							className="pt-2 text-neutral-800 text-sm [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: TipTap HTML sanitized via sanitizeCvHtml
							dangerouslySetInnerHTML={{ __html: descriptionHtml }}
						/>
					)}
				</header>

				{order
					.filter((key) => key !== "identity")
					.map((key) => (
						<section key={key} className="space-y-1">
							<h2 className="border-neutral-300 border-b font-semibold text-xs uppercase tracking-wide">
								{t(`cvEditor.section.${key}`)}
							</h2>
							<p className="text-neutral-500 text-xs">
								{t("cvEditor.preview.sectionEmpty")}
							</p>
						</section>
					))}
			</div>
		</article>
	);
}
