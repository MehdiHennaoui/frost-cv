import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Cv } from "@/entities/cv";
import {
	customSectionIdFromKey,
	isCustomSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { i18n } from "@/shared/i18n";
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
import { text } from "./pdf-text";
import { tipTapHtmlToReactPdf } from "./tiptap-html-to-react-pdf";

const space = {
	1: 4,
	2: 8,
	3: 12,
	4: 16,
	5: 20,
	6: 24,
} as const;

const styles = StyleSheet.create({
	page: {
		...text("sm"),
		paddingTop: 18,
		paddingBottom: 18,
		paddingHorizontal: 18,
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
		marginBottom: space[4],
	},
	sectionTitle: {
		...text("xs"),
		fontFamily: "Helvetica-Bold",
		borderBottomWidth: 1,
		borderBottomColor: "#000",
		paddingBottom: space[1],
		marginBottom: space[3],
	},
	entry: {
		marginBottom: space[3],
	},
	entryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 2,
	},
	entryTitle: {
		...text("sm"),
		fontFamily: "Helvetica-Bold",
		flexGrow: 1,
		flexShrink: 1,
		paddingRight: space[3],
	},
	muted: {
		...text("xs"),
		color: "#525252",
	},
	empty: {
		...text("xs"),
		color: "#737373",
	},
});

type ReactPdfCanadianDocumentProps = {
	cv: Cv;
};

function entryHeading(
	primary: string,
	secondary: string,
	location: string,
	fallback: string,
): string {
	const left = [primary, secondary].filter(Boolean).join(", ");
	const withLocation = location
		? left
			? `${left} — ${location}`
			: location
		: left;
	return withLocation || fallback;
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
											const title = entryHeading(
												entry.jobTitle,
												entry.company,
												entry.location,
												cvT("cvEditor.experiences.untitled"),
											);
											return (
												<View key={entry.id} style={styles.entry}>
													<View style={styles.entryRow}>
														<Text style={styles.entryTitle}>{title}</Text>
														{range && <Text style={styles.muted}>{range}</Text>}
													</View>
													{tipTapHtmlToReactPdf(entry.description)}
												</View>
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
											const title = entryHeading(
												entry.degree,
												entry.school,
												entry.location,
												cvT("cvEditor.education.untitled"),
											);
											return (
												<View key={entry.id} style={styles.entry}>
													<View style={styles.entryRow}>
														<Text style={styles.entryTitle}>{title}</Text>
														{range && <Text style={styles.muted}>{range}</Text>}
													</View>
												</View>
											);
										})
									)}
								</View>
							);
						}

						if (key === "languages") {
							return (
								<View key={key} style={styles.section}>
									<Text style={styles.sectionTitle}>
										{cvT(`cvEditor.section.${key}`)}
									</Text>
									{languages.length === 0 ? (
										<Text style={styles.empty}>
											{cvT("cvEditor.preview.sectionEmpty")}
										</Text>
									) : (
										languages.map((entry) => (
											<Text key={entry.id} style={{ marginBottom: 2 }}>
												{[entry.language, entry.level]
													.filter(Boolean)
													.join(" — ") || cvT("cvEditor.languages.untitled")}
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
