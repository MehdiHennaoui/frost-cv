import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";

import type { Cv } from "@/entities/cv";
import {
	customSectionIdFromKey,
	isCustomSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { i18n } from "@/shared/i18n";
import { customSectionOf } from "../../model/sections/custom-section-fields";
import {
	educationDateRangeLabel,
	educationOf,
} from "../../model/sections/education-fields";
import {
	experienceDateRangeLabel,
	experiencesOf,
} from "../../model/sections/experience-fields";
import { identityFieldsOf } from "../../model/sections/identity-fields";
import { languagesOf } from "../../model/sections/language-fields";
import { space, text } from "./pdf-text";
import { tipTapHtmlToReactPdf } from "./tiptap-html-to-react-pdf";

const styles = StyleSheet.create({
	page: {
		...text("sm"),
		paddingTop: space[4],
		paddingBottom: space[4],
		paddingHorizontal: space[4],
		fontFamily: "Helvetica",
		color: "#000",
	},
	header: {
		marginBottom: space[4],
	},
	headerCentered: {
		alignItems: "center",
		marginBottom: space[2],
	},
	name: {
		...text("2xl"),
		fontFamily: "Helvetica-Bold",
		letterSpacing: -0.3,
		marginBottom: space[1],
		textAlign: "center",
	},
	jobTitle: {
		...text("base"),
		marginBottom: space[1],
		textAlign: "center",
	},
	contacts: {
		...text("xs"),
		color: "#404040",
		textAlign: "center",
	},
	description: {
		marginTop: 0,
		marginBottom: 0,
	},
	section: {
		marginBottom: space[2],
	},
	sectionTitle: {
		...text("sm"),
		fontFamily: "Helvetica-Bold",
		borderBottomWidth: 1,
		borderBottomColor: "#000",
		paddingBottom: space[1],
		marginBottom: space[3],
	},
	entryGap: {
		height: space[3],
	},
	entryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 2,
	},
	entryTitleWrap: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		paddingRight: space[3],
	},
	entryTitle: {
		...text("sm"),
		fontFamily: "Helvetica-Bold",
	},
	entrySubtitle: {
		...text("xs"),
		fontFamily: "Helvetica",
		color: "#525252",
	},
	muted: {
		...text("sm"),
		color: "#525252",
		flexShrink: 0,
	},
	empty: {
		...text("xs"),
		color: "#737373",
	},
});

/** Prefer filling leftover page space over moving a whole block (react-pdf default is 2). */
const flowText = { orphans: 1, widows: 1 } as const;

type ReactPdfCanadianDocumentProps = {
	cv: Cv;
};

/** Plain function (not a component) so react-pdf / tests see View/Text in the tree. */
function entryHeadingRow(title: string, range: string, subtitle = "") {
	return (
		<View style={styles.entryRow} wrap={false}>
			<View style={styles.entryTitleWrap}>
				<Text style={styles.entryTitle} {...flowText}>
					{title}
					{subtitle ? (
						<>
							{" "}
							<Text style={styles.entrySubtitle}>{subtitle}</Text>
						</>
					) : null}
				</Text>
			</View>
			{range ? (
				<Text style={styles.muted} {...flowText}>
					{range}
				</Text>
			) : null}
		</View>
	);
}

export function ReactPdfCanadianDocument({
	cv,
}: ReactPdfCanadianDocumentProps) {
	const cvT = i18n.getFixedT(cv.locale);
	const identity = identityFieldsOf(cv.content);
	const experiences = experiencesOf(cv.content);
	const education = educationOf(cv.content);
	const languages = languagesOf(cv.content);
	const presentLabel = cvT("cvEditor.preview.present");
	const fullName = [identity.firstName, identity.lastName]
		.filter(Boolean)
		.join(" ");
	const order = sectionOrderOf(cv.content);
	// react-pdf's update keeps a moved child in its old slot. A new key rebuilds the tree.
	const documentKey = [
		order.join(","),
		experiences.map((entry) => entry.id).join(","),
		education.map((entry) => entry.id).join(","),
		languages.map((entry) => entry.id).join(","),
	].join("|");
	const contacts = [
		identity.email,
		identity.phone,
		identity.postalCode,
		identity.linkedin,
		identity.github,
		identity.website,
	].filter(Boolean);
	const description = tipTapHtmlToReactPdf(identity.description);

	return (
		<Document
			key={documentKey}
			title={fullName || "CV"}
			author={fullName || undefined}
		>
			<Page size="LETTER" style={styles.page}>
				<View style={styles.header}>
					<View style={styles.headerCentered}>
						<Text style={styles.name}>
							{fullName || cvT("cvEditor.preview.unnamed")}
						</Text>
						{identity.jobTitle && (
							<Text style={styles.jobTitle}>{identity.jobTitle}</Text>
						)}
						{contacts.length > 0 && (
							<Text style={styles.contacts}>{contacts.join(" | ")}</Text>
						)}
					</View>
					{description && <View style={styles.description}>{description}</View>}
				</View>

				{order
					.filter((key) => key !== "identity")
					.map((key) => {
						if (key === "experiences") {
							return (
								<View key={key} style={styles.section}>
									<Text style={styles.sectionTitle}>
										{cvT(`cvEditor.section.${key}`)}
									</Text>
									{experiences.length === 0 ? (
										<Text style={styles.empty}>
											{cvT("cvEditor.preview.sectionEmpty")}
										</Text>
									) : (
										experiences.map((entry) => {
											const range = experienceDateRangeLabel(
												entry,
												cv.locale,
												presentLabel,
											);
											const title =
												entry.jobTitle || cvT("cvEditor.experiences.untitled");
											const subtitle = [entry.company, entry.location]
												.filter(Boolean)
												.join(", ");
											return (
												<Fragment key={entry.id}>
													{entryHeadingRow(title, range, subtitle)}
													{tipTapHtmlToReactPdf(entry.description)}
													<View style={styles.entryGap} break />
												</Fragment>
											);
										})
									)}
								</View>
							);
						}

						if (key === "education") {
							return (
								<View key={key} style={styles.section}>
									<Text style={styles.sectionTitle}>
										{cvT(`cvEditor.section.${key}`)}
									</Text>
									{education.length === 0 ? (
										<Text style={styles.empty}>
											{cvT("cvEditor.preview.sectionEmpty")}
										</Text>
									) : (
										education.map((entry) => {
											const range = educationDateRangeLabel(entry, cv.locale);
											const title =
												entry.degree || cvT("cvEditor.education.untitled");
											const subtitle = [entry.school, entry.location]
												.filter(Boolean)
												.join(", ");
											return (
												<Fragment key={entry.id}>
													{entryHeadingRow(title, range, subtitle)}
													<View style={styles.entryGap} />
												</Fragment>
											);
										})
									)}
								</View>
							);
						}

						if (key === "languages") {
							return (
								<View key={key} style={styles.section} break>
									<Text style={styles.sectionTitle}>
										{cvT(`cvEditor.section.${key}`)}
									</Text>
									{languages.length === 0 ? (
										<Text style={styles.empty}>
											{cvT("cvEditor.preview.sectionEmpty")}
										</Text>
									) : (
										languages.map((entry) => (
											<Text key={entry.id} style={{ marginBottom: 1 }}>
												{[entry.language, entry.level]
													.filter(Boolean)
													.join(": ") || cvT("cvEditor.languages.untitled")}
											</Text>
										))
									)}
								</View>
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
							const body = tipTapHtmlToReactPdf(section.description);
							return (
								<View key={key} style={styles.section}>
									<Text style={styles.sectionTitle}>
										{section.title.trim() || cvT("cvEditor.customs.untitled")}
									</Text>
									{body ?? (
										<Text style={styles.empty}>
											{cvT("cvEditor.preview.sectionEmpty")}
										</Text>
									)}
								</View>
							);
						}

						return null;
					})}
			</Page>
		</Document>
	);
}
