import type { Cv } from "@/entities/cv";
import {
	customSectionIdFromKey,
	isCustomSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { i18n, useAppTranslation } from "@/shared/i18n";
import { sanitizeCvHtml } from "@/shared/lib/sanitize-html";
import { customSectionOf } from "../model/custom-section-fields";
import {
	educationDateRangeLabel,
	educationOf,
} from "../model/education-fields";
import {
	experienceDateRangeLabel,
	experiencesOf,
} from "../model/experience-fields";
import { identityFieldsOf } from "../model/identity-fields";
import { languagesOf } from "../model/language-fields";

type CanadianCvPreviewProps = {
	cv: Cv;
};

function presentLabelForCvLocale(locale: Cv["locale"]): string {
	return i18n.getFixedT(locale)("cvEditor.preview.present");
}

export function CanadianCvPreview({ cv }: CanadianCvPreviewProps) {
	const { t } = useAppTranslation();
	const identity = identityFieldsOf(cv.content);
	const experiences = experiencesOf(cv.content);
	const education = educationOf(cv.content);
	const languages = languagesOf(cv.content);
	const presentLabel = presentLabelForCvLocale(cv.locale);
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
					.map((key) => {
						if (key === "experiences") {
							return (
								<section key={key} className="space-y-3">
									<h2 className="border-neutral-300 border-b font-semibold text-xs uppercase tracking-wide">
										{t(`cvEditor.section.${key}`)}
									</h2>
									{experiences.length === 0 ? (
										<p className="text-neutral-500 text-xs">
											{t("cvEditor.preview.sectionEmpty")}
										</p>
									) : (
										<ul className="space-y-3">
											{experiences.map((entry) => {
												const range = experienceDateRangeLabel(
													entry,
													cv.locale,
													presentLabel,
												);
												const bodyHtml = sanitizeCvHtml(entry.description);
												return (
													<li key={entry.id} className="space-y-1">
														<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
															<p className="font-semibold">
																{[entry.jobTitle, entry.company]
																	.filter(Boolean)
																	.join(" · ") ||
																	t("cvEditor.experiences.untitled")}
															</p>
															{range && (
																<p className="text-neutral-600 text-xs">
																	{range}
																</p>
															)}
														</div>
														{entry.location && (
															<p className="text-neutral-700 text-xs">
																{entry.location}
															</p>
														)}
														{bodyHtml && (
															<div
																className="text-neutral-800 text-sm [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
																// biome-ignore lint/security/noDangerouslySetInnerHtml: TipTap HTML sanitized via sanitizeCvHtml
																dangerouslySetInnerHTML={{ __html: bodyHtml }}
															/>
														)}
													</li>
												);
											})}
										</ul>
									)}
								</section>
							);
						}

						if (key === "education") {
							return (
								<section key={key} className="space-y-3">
									<h2 className="border-neutral-300 border-b font-semibold text-xs uppercase tracking-wide">
										{t(`cvEditor.section.${key}`)}
									</h2>
									{education.length === 0 ? (
										<p className="text-neutral-500 text-xs">
											{t("cvEditor.preview.sectionEmpty")}
										</p>
									) : (
										<ul className="space-y-3">
											{education.map((entry) => {
												const range = educationDateRangeLabel(entry, cv.locale);
												return (
													<li key={entry.id} className="space-y-1">
														<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
															<p className="font-semibold">
																{[entry.degree, entry.school]
																	.filter(Boolean)
																	.join(" · ") ||
																	t("cvEditor.education.untitled")}
															</p>
															{range && (
																<p className="text-neutral-600 text-xs">
																	{range}
																</p>
															)}
														</div>
														{entry.location && (
															<p className="text-neutral-700 text-xs">
																{entry.location}
															</p>
														)}
													</li>
												);
											})}
										</ul>
									)}
								</section>
							);
						}

						if (key === "languages") {
							return (
								<section key={key} className="space-y-3">
									<h2 className="border-neutral-300 border-b font-semibold text-xs uppercase tracking-wide">
										{t(`cvEditor.section.${key}`)}
									</h2>
									{languages.length === 0 ? (
										<p className="text-neutral-500 text-xs">
											{t("cvEditor.preview.sectionEmpty")}
										</p>
									) : (
										<ul className="space-y-1">
											{languages.map((entry) => (
												<li key={entry.id}>
													{[entry.language, entry.level]
														.filter(Boolean)
														.join(" — ") || t("cvEditor.languages.untitled")}
												</li>
											))}
										</ul>
									)}
								</section>
							);
						}

						if (isCustomSectionKey(key)) {
							const section = customSectionOf(
								cv.content,
								customSectionIdFromKey(key),
							);
							if (!section) {
								return null;
							}
							const bodyHtml = sanitizeCvHtml(section.description);
							return (
								<section key={key} className="space-y-3">
									<h2 className="border-neutral-300 border-b font-semibold text-xs uppercase tracking-wide">
										{section.title.trim() || t("cvEditor.customs.untitled")}
									</h2>
									{bodyHtml ? (
										<div
											className="text-neutral-800 text-sm [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: TipTap HTML sanitized via sanitizeCvHtml
											dangerouslySetInnerHTML={{ __html: bodyHtml }}
										/>
									) : (
										<p className="text-neutral-500 text-xs">
											{t("cvEditor.preview.sectionEmpty")}
										</p>
									)}
								</section>
							);
						}

						return null;
					})}
			</div>
		</article>
	);
}
